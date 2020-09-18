
// ******** 
// ******** Section 1: Fixed and always used Main Imports **********
// ******** 

//These Configs are aklways used. If these need to be conditional, move them to section 3 
//Config is **ALWAYS** loaded. If need to use RC, modifications will need to be made to service calls
const config = require('config');
//This returns a function, not an object or a class
const ExpressFunction = require('express');
const mainApp = ExpressFunction();
//This return a Class and not a function
const MyJoiClass = require('joi');

// ******** 
// ******** Section 2: Load initially needed property items needed in this section **********
// ******** 
//These items are needed to run the app (at the very minimum). 
//Other values can be loaded in thoer respective sections. These are global in nature 

//Establish a common value system for ON/OFF and TRUE/FALSE type properties for all properties uniformly 
const PROP_ENV_VALUE_ON = getDefaultsForOn(getRunTimeValues ("appEnvConfig.envNameList.appEnvOnValue"));
//Note - for env overrides, we have to force a check against OFF (non existent property vs property being explicitly set to OFF) 
const PROP_ENV_VALUE_OFF = getDefaultsForOff(getRunTimeValues ("appEnvConfig.envNameList.appEnvOffValue"));

//These are central or commonly used properties. Others may be added here or they may be read near their sections 
const APP_USE_EXPRESS_JSON = getTrueFalseForProperty(getRunTimeValues ("RuntimEnv.runtimeJSONMiddelware"));
const APP_DEBUG = getTrueFalseForProperty (getRunTimeEnvValues ("RuntimEnv", "appEnvConfig.envNameList.appDebugOnControl"));
const APP_USE_STATIC_ROUTE = getTrueFalseForProperty (getRunTimeValues ("RuntimEnv.runtimeAllowStaticFiles"));
const APP_USE_HELMET = getTrueFalseForProperty (getRunTimeValues ("RuntimEnv.runHelmet"));
const APP_USE_URLENCODE = getTrueFalseForProperty (getRunTimeValues ("RuntimEnv.runUrlEncoder"));
const APP_USE_CUST_MIDDLEWR = getTrueFalseForProperty (getRunTimeValues ("RuntimEnv.runCustomMiddelware"));
const APP_USE_MORGAN = getTrueFalseForProperty (getRunTimeValues ("RuntimEnv.runMorgan"));

// ******** 
// ******** Section 3: Conditional Imports **********
// ******** 

//Middleware - Logging - Authenticating 
//This call will set any JSON object inside the request into request.body object
//This is mandatory, although it can be made conditional based on business needs
if (APP_USE_EXPRESS_JSON) mainApp.use(ExpressFunction.json());
if (APP_USE_CUST_MIDDLEWR) {
    mainApp.use (function(reqm, res, next){
        //This is example of a custom middelware function. For demo purposes we will onlyprint to output log
        //NOTE: This function can be outsourced to a different module etc.
        console.log('Custom Middleware called!') ;
        //Next() must be called or the thread will not proceed 
        next();
    });
    //Authenticating midleware sample
    mainApp.use (function(reqm, res, next){
        //This is example of a custom middelware function. For demo purposes we will onlyprint to output log
        //NOTE: This function can be outsourced to a different module etc.
        console.log('We are authenticating ...') ;
        //Next() must be called or the thread will not proceed 
        next();
    });
}
//URl encoder - this will allow values for POST/PUT to be in a URL encoded format as well: key1=value1&key2=value2 etc.
//This method will parse these URL encoded key value pairs and encode them as JSON objects
//The extended option allows complex items such as arrays to be parsed etc.
if (APP_USE_URLENCODE) mainApp.use(ExpressFunction.urlencoded({ extended: true }));  
//helmet - sets Http Header
if (APP_USE_HELMET) { const helmet = require ('helmet'); mainApp.use(helmet());  }
//Http Request Logger - Morgan
if (APP_USE_MORGAN) { 
    const APP_USE_MORGAN_STRING_OPTIONS_NAME =  getRunTimeValues ("RuntimEnv.runMorganParams.currentUsed");
    const APP_USE_MORGAN_STRING_OPTIONS_VALUE =  getRunTimeValues (`RuntimEnv.runMorganParams.${APP_USE_MORGAN_STRING_OPTIONS_NAME}`);
    const APP_USE_MORGAN_STRING_STRING_NAME =  getRunTimeValues (`RuntimEnv.runMorganParams.stringSuffix`);
    const APP_USE_MORGAN_STRING_STRING_VALUE =  getRunTimeValues (`RuntimEnv.runMorganParams.${APP_USE_MORGAN_STRING_OPTIONS_NAME}${APP_USE_MORGAN_STRING_STRING_NAME}`);
    const morgan = require ('morgan');

    if (APP_USE_MORGAN_STRING_OPTIONS_VALUE.length == 0) { mainApp.use(morgan("tiny")); console.log("Morgan -> Missing properties -> Using default Tiny format"); }
    else {
        if (APP_USE_MORGAN_STRING_STRING_VALUE.length == 0)
            mainApp.use(morgan(APP_USE_MORGAN_STRING_OPTIONS_VALUE)); 
        else
            mainApp.use(morgan(APP_USE_MORGAN_STRING_STRING_VALUE)); 
        //Print the in use format to console ...
        console.log(getRunTimeValues ("RuntimEnv.runMorganParams." + APP_USE_MORGAN_STRING_OPTIONS_NAME + getRunTimeValues ("RuntimEnv.runMorganParams.descriptorSuffix")));
    }
    
}

//Static routes:
if (APP_USE_STATIC_ROUTE) {
    const multiStaticConfigCount = getRunTimeValuesInteger("RuntimEnv.runtimeStaticConfig.multiStaticConfigCount", 10);
    for (let i = 1; i <= multiStaticConfigCount; i ++) {
        let staticDirName = getRunTimeValues (`RuntimEnv.runtimeStaticConfig.multiStaticConfig${i}.mountPathAndDir`) ;
        if (staticDirName.length == 0) { break ; }
        let staticUrlSuffix = getRunTimeValues (`RuntimEnv.runtimeStaticConfig.multiStaticConfig${i}.mountPathInUrl`) ;
        if (staticUrlSuffix.length == 0) {
            console.log(`App Init -> Adding Static Route to Url Root for folder: ${staticDirName}`);
            mainApp.use(ExpressFunction.static(staticDirName)) ;
        }
        else {
            console.log(`App Init -> Adding Static Route to Url ${staticUrlSuffix} for folder: ${staticDirName}`);
            mainApp.use(staticUrlSuffix, ExpressFunction.static(staticDirName)) ;
        }
    }
}

// ******** 
// ******** Section 4: Database Section - Either real or simulated. **********
// ******** 
const allCoursesFromDB = [] ;

function getAllCourses() {
    return allCoursesFromDB;
}

// ******** 
// ******** Section 5: URL Maps/Routes **********
// ******** 

const rootRoute = '/';
const courseRuoutePrefix = getRunTimeValuesDefault("appEnvConfig.apiRouteConfig.routeApiPrefix", "/api") ;
const coursesRouteGetSuffix = getRunTimeValuesDefault("appEnvConfig.apiRouteConfig.routeApiGet", "/courses") ;
const coursesRouteIdName = getRunTimeValuesDefault("appEnvConfig.apiRouteConfig.routeApiGetId", "/:id");
const courseRouteIdValue = coursesRouteIdName.substr (getRunTimeValuesInteger("appEnvConfig.apiRouteConfig.routeApiGetId.routeAppGetIdCharsToRemove", 2));


// ******** 
// ******** Section 4: URL Handlers + View Layer combined **********
// ******** 

mainApp.get(rootRoute, (req, res) => {
    res.send("Welcome and Hello World!!!");
});

mainApp.get((courseRuoutePrefix + coursesRouteGetSuffix), (req, res) => {
    res.send(getAllCourses());
});

mainApp.get((courseRuoutePrefix + coursesRouteGetSuffix + coursesRouteIdName), (req, res) => {
    let courseFound = getCourseById(req, res) ;
    if (courseFound)
        res.send(courseFound);
});

mainApp.post ((courseRuoutePrefix + coursesRouteGetSuffix), (req, res) => {
    if (!checkCourseTextError(req, res)) {
        if (!getCourseAlreadyExistsByName(req, res, req.body.coursename)) {
            let nextCourse = {
                id: getAllCourses().length + 1,
                coursename: captialize(req.body.coursename.trim().toLowerCase())
            } ;
            getAllCourses().push (nextCourse);
            res.send (getAllCourses()) ;
        }
    }
});

mainApp.delete ((courseRuoutePrefix + coursesRouteGetSuffix + coursesRouteIdName), (req, res) => {
        let matchedC = getCourseById(req, res) ;
        if (matchedC) { 
            const index = getAllCourses().indexOf(matchedC);
            getAllCourses().splice(index, 1);
            res.send(getAllCourses());
        }
});

mainApp.put ((courseRuoutePrefix + coursesRouteGetSuffix + coursesRouteIdName), (req, res) => {
    //Look up the ID 
    if (!checkCourseTextError(req, res)) {
        if (!getCourseAlreadyExistsByName(req, res, req.body.coursename)) {
            let matchedC = getCourseById(req, res) ;
            if (matchedC) {
                matchedC.coursename = captialize(req.body.coursename.trim().toLowerCase());
                res.send (getAllCourses()) ;
            }
        }
    }
})


// ******** 
// ******** Section 6: Inits and Util Functions **********
// ******** 


const APP_PORT_ENV_VALUE = getRunTimeEnvValues ("RuntimEnv", "appEnvConfig.envNameList.appEndPortControl");

const appMainPort = process.env.APP_MAIN_PORT || process.env.PORT || APP_PORT_ENV_VALUE || 3001;
mainApp.listen(appMainPort, () => {
    console.log (`Started API Server. Listening on Port ${appMainPort} .... `) ;
})

//This is code borrowwed from a Stack Overfloe post:
//It MIGHT NOT  work on characters with Accents. For demo purposes only
const captialize = words => words.split(' ').map( w =>  w.substring(0,1).toUpperCase()+ w.substring(1)).join(' ')


// ******** 
// ******** Section 7: Service Layer **********
// ******** 

function getCourseAlreadyExistsByName (request, response, coursename) {
    coursename = coursename.trim().toLowerCase();
    if (coursename && coursename.length > 0) {
        let matchedC = getAllCourses().find(c => c.coursename.trim().toLowerCase() === coursename);
        if (matchedC) {
            return errorCourse400Exists(request, response, matchedC.id);
        }
    }
    return false;
}

function getCourseById (request, response) {
    let validCourseId = getValidCourseId(request, response);
    if (validCourseId > 0) {
        let matchedC = getAllCourses().find(c => c.id === validCourseId);
        if (matchedC) return matchedC;
        errorCourseId404Error(request, response, request.params.id);
        return undefined;
    }
}

function getValidCourseId (request, response) {
    const idNum = parseInt(request.params[courseRouteIdValue], 10);
    if (idNum && idNum > 0) return idNum;
    errorCourse400Error(request, response, request.params.id);
    return 0;
}

function getDefaultsForOn(propertyValue) {
    if (!propertyValue || propertyValue.length == 0) propertyValue = "ON";
    else propertyValue = propertyValue.toUpperCase();
    return propertyValue;
}

function getDefaultsForOff(propertyValue) {
    if (!propertyValue || propertyValue.length == 0) propertyValue = "OFF";
    else propertyValue = propertyValue.toUpperCase();
    return propertyValue;
}

function getTrueFalseForProperty(propertyValue) {
    let retVal = false;
    if (propertyValue && propertyValue.length > 0){
        if (propertyValue.toUpperCase() === PROP_ENV_VALUE_ON) retVal = true ;
        if (propertyValue.toUpperCase() === PROP_ENV_VALUE_OFF) retVal = false ;
        if (propertyValue.toLowerCase() === 'true') retVal = true ;
        if (propertyValue.toLowerCase() === 'false') retVal = false ;
    }
    return retVal;
}
//Reads a Prop Name, Uses that Name and prefix to read in another PROP name. Demonstrates using dynamically named prop names
// NOTE: The PROPERTY NAME defined under Runtime.XXXXXXX can be set in environment. If set in environment, it takles precedemce
// Exaample - config file Runtime.APP_DEBUG = ON, but env value has export APP_DEBUG=OFF, then APP_DEBUG will be considered OFF
function getRunTimeEnvValues(propSectionPrefix, envPropNameInFull) {
    let { propNameInFull, ropValue }  = "" ;
    if (config.has(envPropNameInFull)) {
        let simplePropName = config.get(envPropNameInFull);
        propNameInFull = propSectionPrefix + "." + simplePropName ;
        if (config.has(propNameInFull)) {
            ropValue = process.env[simplePropName] || config.get(propNameInFull);
        }
    }
    return ropValue ;
}

function getRunTimeValues(envPropNameInFull) {
    let propValue  = "" ;
    if (config.has(envPropNameInFull)) {
        propValue = config.get(envPropNameInFull);
    }
    return propValue ;
}

function getRunTimeValuesInteger(envPropNameInFull, defaultValue) {
    let propValue  = getRunTimeValues(envPropNameInFull) ;
    if (!propValue || propValue.length == 0 || isNaN(propValue)) {
        return (defaultValue) ? defaultValue : 0;
    }
    return parseInt(propValue, 10) ;
}

function getRunTimeValuesDefault(envPropNameInFull, defaultValue) {
    let propValue  = getRunTimeValues(envPropNameInFull) ;
    if (!propValue || propValue.length == 0) {
        return "";
    }
    return propValue ;
}

// ******** 
// ******** Section 8: Data Service Validation/Display/Handle Errors **********
// ******** 

function checkCourseTextError (request, response) {
    let error = getCourseError(request.body) ;
    if (error) return errorCourseText400Error(request, response, error.details[0].message);
    return false;
}

//Set up JOI 
const CourseNameValidationSchema = MyJoiClass.object({
    coursename: MyJoiClass.string().trim().regex(/^[a-z\s]*$/i).min(3).required()
});
function getCourseError(courseinfo) {
    let { error, value } = CourseNameValidationSchema.validate(courseinfo);
    //console.log (error);
    //console.log (value);
    if (error) {
        return error;
    }
    return undefined;
}

// ******** 
// ******** Section 9: Error View (Response) Layer: Respond with 404 and 400 as needed **********
// ******** 

function errorCourseText400Error(request, response, error) {
    //Intent of this method: 
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(400).send(`Error in ${request.method} request: ${error}`);
    return true;
}

function errorCourseId404Error(request, response, id) {
    response.status(404).send(`For ${request.method} request, unable to locate Course with ID : ${id}`);
    return true;
}

function errorCourse400Error(request, response, id) {
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(400).send(`For ${request.method} request, Invalid Course ID : ${id}`);
    return true;
}

function errorCourse400Exists(request, response, id) {
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(400).send(`For ${request.method} request, Course already Exists with ID : ${id}`);
    return true;
}


