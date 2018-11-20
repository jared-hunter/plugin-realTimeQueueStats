# plugin-realTimeQueueStats

1. run npm install
2. Add the functions in the ./src/functions folder as different twilio functions with the same name in your flex project
3. Ensure the twiio function configuration variables for workspace and sync service id are set. Make sure to use the default sync service as thats the one made available in flex by default.
4. Set your accountSid and serviceBaseURL in /public/appConfig.js as appropriate from values found in your flex project (dont include https://)
5. Configure your taskRouter workspace in twilio/console. Edit the events call back url to the path of the function you just created (TaskRouter -> Workspaces -> Flex Task Assignment -> Settings -> Event Callbacks Url). e.g. https://some-host/getQueueStatistics
6. To Start; npm start
7. To deploy; execute 'npm run build' and copy ./build/plugin-realTimeQueueStats.js to your assests on your flex project

# Known Limitiations

1.  There is an upper limit for execution time of functions as the number of queues increases so does execution time. This limits the reliable operation of this function to a workspace with no more than 80 queues.
2.  Execution of this function triggers an itemUpdated sync event for each queue on the syncMap (which matches the # queues in the workspace). Ideally one event should trigger one update. This can be optimized in a later version.
