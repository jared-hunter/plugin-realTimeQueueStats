# plugin-realTimeQueueStats

this plugin adds a sidenav item to the flex desktop for viewing a list of queues and a subset of the realtime stats available for the queue.

Queue Name, Tasks Assigned, Tasks Pending, Tasks Reserved, Tasks Wrapping, Total Tasks, Total Available Workers.

The data is retrieved from a Twilio Sync Map and listeners for the map are added so any changes to the map are represented on the table.

All data on the realTimeStatistics (https://www.twilio.com/docs/taskrouter/api/taskqueue-statistics#taskqueue-realtime-statistics) are available within the map. The react components creates a table display of just some of these stats. The main purpose of this plugin is to illustrate how data can be assigned to the map and passed through to the plugin via the sync map for real time updates. Triggering of the function is performed by the flex workspace callback URI, it uses the function as a webhook so any changes to the workspace result in an update to the map. This is the main area where optimizations could be made.

This plugin is for demonstration purposes only and is not recommended for production use.

# Directions for use

1. run npm install
2. Add the functions in the ./src/functions folder as different twilio functions with the same name in your flex project
3. Ensure the twiio function configuration variables for workspace and sync service id are set. Make sure to use the default sync service as thats the one made available in flex by default.
4. Set your accountSid and serviceBaseURL in /public/appConfig.js as appropriate from values found in your flex project (dont include https://)
5. Configure your taskRouter workspace in twilio/console. Edit the events call back url to the path of the function you just created (TaskRouter -> Workspaces -> Flex Task Assignment -> Settings -> Event Callbacks Url). e.g. https://some-host/getQueueStatistics
6. Ensure the npm version of twilio referenced within functions -> configure -> dependencies is 3.23.2 or greater
7. To Start; npm start
8. To deploy; execute 'npm run build' and copy ./build/plugin-realTimeQueueStats.js to your assests on your flex project

# Known Limitiations

1.  There is an upper limit for execution time of functions of 5 seconds. As the number of queues increases in a workspace so does execution time of this function. This limits the reliable operation of this function to a workspace with no more than 80 queues.
2.  Execution of this function triggers an itemUpdated sync event for each queue on the syncMap (which matches the # queues in the workspace). Ideally one event should trigger one update. This can be optimized in a later version.
