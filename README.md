# Current progress

Currently, the server will

- After a while (every 10 seconds), server will push a random value to adafruit's moisture sensor
- Listen for moisture from adafruit
- When moisture change, call notificationService to push notification
- notificationService will check plantSettings (threshold) before deciding to push noti or not
- The school's provided ada account is in the .env file
- But the access key for adaServer is GET from a link (in GetJSON.js)

## Why server?

- Cause there must be a background progress to keep updates from adafruit when client is not logged in!
- Also, since is's almost impossible to get pass data from ada feed, we can use our server to push data into firebase and then later client can take that data and plot history!.
- It's just impossible to make notification make sense when you do not have a server!

## TODO

- Record history in the envCond Services
- Add humi,light,temp
- Add plant Settings to firebase
