# Express Demo App
## This is a sample app Written for Node.js using Express, Joi and other components

App Description: A basic RESTful API Demo App

*Note: The use of txn- prefix indicates that this is transitional project only at this stage*

#### Instructions: To setup, run and view the app follow the instructions in each section below ####

- **Setup**
  - Ensure Node.js is installed and verified
    - If not installed, visit https://nodejs.org/ and follow instructions 
    - Run these commands to verify 
      - `node -v`
      - `npm - v`
  - Server Port: Set either of two environment variables to the port number
    - `APP_MAIN_PORT`
      - This takes precedence ove the other (if both are set)
    - `PORT`
      - This is commonly used in cloud/AWS
    - `APP_MAIN_PORT` takes precedence
    - If neither is set application defaults to port 3001
      - To permanently change the default locate this code to change
        - `appMainPort`
    - Example: Assume port 7001 and using the first variable
      - Windows: 
        - `set APP_MAIN_PORT=7001`
      - Linux/Mac: 
        - `$export APP_MAIN_PORT=7001` 
        - Note: May require sudo or can be set in the startup scripts
  - If not done already, bring in the modeules needed:
    - `npm i`
  - Verify the modules and that Express and Joi are installed:
    - `npm list --depth=0 `
  - _Optional_: This will enable dynamic reset of server when source files are changed: 
    - `npm i -g nodemon`
- **To Run the application**  
  - Use one of the two options based on what was setup 
  - To stop the app when it is running, use Ctrl-C in the console window
    - When using nodemon, run this command:
      - `nodemon index.js`
      - _Note: The server will pick up any changes dynamically and it can be seen in the console log when that happens_
    - When using Node.js, run this command:
      - `node index.js`
      - _Note: Server will need to stopped and restarted for any changes to take effect_
- **To View/Submit requests to the application**        
  - Base address (assuming port 30001, shows **Welcome and Hello World** message only):
    - `http://localhost:3001`
  - A browser will only be able to GET the information at this location:
    - `http://localhost:3001/api/courses`
    - `http://localhost:3001/api/courses/1`
    - `http://localhost:3001/api/courses/2`
    - etc.
  - Development tools/browser extensions can be used for POST, PUT, DELETE
  - Two examples of such tools are (many exist, do your own research): 
    - **Postman**: This is a standalone desktop app and requires an account (Third Party)
    - **RESTer**: This is a Firefox extension (Third Party)
    - **WARNING: Use the above at your own risk.**