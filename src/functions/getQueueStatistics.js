/*
 *  Written By: Jared Hunter
 *
 *  This function was written to list all queue stats for a flex workspace.
 *
 *
 *  DEPENDENCIES: After creating function ensure environment variable is added
 *     TWILIO_FLEX_WORKSPACE_SID assign the value of your flex workspace
 *     TWILIO_FLEX_SYNC_SID assign the value of the sync service to map stats
 *
 *  KNOWN ISSUERS:
 *
 * 	There is an upper limit for execution time of functions
 * 	as the number of queues increases so does execution time.  This limits the
 *  reliable operation of this function to a workspace with no more than 80 queues.
 *
 *  Execution of this function triggers an itemUpdated sync event for each queue
 *  on the syncMap (which matches the # queues in the workspace).  Ideally
 *  one event should trigger one update.  This can be optimized in a later version.
 */

exports.handler = function(context, event, callback) {
  console.log("Create task queues for %s", event.clientName);

  const client = context.getTwilioClient();
  const syncService = client.sync.services(context.TWILIO_FLEX_SYNC_SID);
  const response = new Twilio.Response();
  const MAP_NAME = "queueStats";

  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "OPTIONS POST");
  response.appendHeader("Content-Type", "application/json");
  response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

  const validateParameters = function(context, event) {
    var errorMessages = "";
    errorMessages += context.TWILIO_FLEX_WORKSPACE_SID
      ? ""
      : "Missing TWILIO_FLEX_WORKSPACE_SID from context environment variables, ";
    errorMessages += context.TWILIO_FLEX_SYNC_SID
      ? ""
      : "Missing TWILIO_FLEX_SYNC_SID from context environment variables, ";

    return errorMessages;
  };

  const ensureSyncMapExists = new Promise(function(resolve, reject) {
    syncService
      .syncMaps(MAP_NAME)
      .fetch()
      .then(() => {
        console.log("already exists"), resolve("Exists");
      })
      .catch(err => {
        console.log(err.message);
        console.log("creating sync map %s", MAP_NAME);
        syncService.syncMaps
          .create({ uniqueName: MAP_NAME })
          .then(sync_map => {
            console.log(sync_map.sid);
            resolve("Created");
          })
          .catch(err => {
            console.log(err.message);
            resolve(err.message);
          });
      });
  });

  const listQueuesPromise = function() {
    return new Promise(function(resolve, reject) {
      client.taskrouter
        .workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
        .taskQueues.list()
        .then(result => {
          resolve(result);
        })
        .catch(err => {
          reject(err.message);
        });
    });
  };

  const listQueueStatistics = function(queueList, index, update) {
    return new Promise(function(resolve, reject) {
      console.log(index);
      if (index < queueList.length - 1) {
        client.taskrouter
          .workspaces(context.TWILIO_FLEX_WORKSPACE_SID)
          .taskQueues(queueList[index].sid)
          .realTimeStatistics()
          .fetch()
          .then(result => {
            result.friendlyName = queueList[index].friendlyName;
            queueList[index].realTimeStatisticsSuccess = true;
            queueList[index].realTimeStatistics = result;
            if (!update) {
              syncService
                .syncMaps(MAP_NAME)
                .syncMapItems.create({
                  key: result.taskQueueSid,
                  data: result
                })
                .then(item => {
                  listQueueStatistics(queueList, index + 1, false).then(() =>
                    resolve(queueList)
                  );
                })
                .catch(err => {
                  console.log(err.message);
                  // retry element but as an update this time
                  listQueueStatistics(queueList, index, true).then(() =>
                    resolve(queueList)
                  );
                });
            } else {
              syncService
                .syncMaps(MAP_NAME)
                .syncMapItems(result.taskQueueSid)
                .update({
                  data: result
                })
                .then(item => {
                  console.log("Succesfuly update sync map item");
                  listQueueStatistics(queueList, index + 1, false).then(() =>
                    resolve(queueList)
                  );
                })
                .catch(err => {
                  console.log(err.message);
                  listQueueStatistics(queueList, index + 1, false).then(() =>
                    resolve(queueList)
                  );
                });
            }
          })
          .catch(err => {
            queueList[index].realTimeStatisticsSuccess = false;
            queueList[index].realTimeStatisticsMessage = err.message;
            listQueueStatistics(queueList, index + 1).then(() =>
              resolve(queueList)
            );
          });
      } else {
        resolve(queueList);
      }
    });
  };

  var errorMessages = validateParameters(context, event);

  if (errorMessages === "") {
    ensureSyncMapExists.then(() => {
      listQueuesPromise().then(result => {
        listQueueStatistics(result, 0, false).then(result => {
          response.setBody(result);
          callback(null, response);
        });
      });
    });
  } else {
    callback(null, { success: false, message: errorMessages });
  }
};
