// ******** 
// ******** Section 1: Main Imports used **********
// ******** 
//This returns a function, not an object or a class
const ExpressFunction = require('express');
const mainApp = ExpressFunction();
mainApp.use(ExpressFunction.json());
//This return a Class and not a function
const MyJoiClass = require('joi');


// ******** 
// ******** Section 2: Database Section - Either real or simulated. **********
// ******** 
const allCoursesFromDB = [] ;

function getAllCourses() {
    return allCoursesFromDB;
}

// ******** 
// ******** Section 3: URL Maps/Routes **********
// ******** 

const rootRoute = '/';
const coursesRoute = '/api/courses';
const coursesIdrootRoute = '/api/courses/:id';

// ******** 
// ******** Section 4: URL Handlers + View Layer combined **********
// ******** 

mainApp.get(rootRoute, (req, res) => {
    res.send("Welcome and Hello World!!!");
});

mainApp.get(coursesRoute, (req, res) => {
    res.send(getAllCourses());
});

mainApp.get(coursesIdrootRoute, (req, res) => {
    let courseFound = getCourseById(req, res) ;
    if (courseFound)
        res.send(courseFound);
});

mainApp.post (coursesRoute, (req, res) => {
    console.log ('Cames Case: ' + captialize('thIS tIS'.toLowerCase()));
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

mainApp.delete (coursesIdrootRoute, (req, res) => {
        let matchedC = getCourseById(req, res) ;
        if (matchedC) { 
            const index = getAllCourses().indexOf(matchedC);
            getAllCourses().splice(index, 1);
            res.send(getAllCourses());
        }
});

mainApp.put (coursesIdrootRoute, (req, res) => {
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
// ******** Section 5: Inits and Util Functions **********
// ******** 


/* const {PORT = APP_PORT || 5001} = process.env;
var iHitCount = 5 ;
mainApp.listen(PORT, () => {
    console.log (`Listening on Port ${PORT} .... ${++iHitCount}`) ;
})*/

const appMainPort = process.env.APP_MAIN_PORT || process.env.PORT || 3001;
mainApp.listen(appMainPort, () => {
    console.log (`Started API Server. Listening on Port ${appMainPort} .... `) ;
})

//This is code borrowwed from a Stack Overfloe post:
//It MIGHT NOT  work on characters with Accents. For demo purposes only
const captialize = words => words.split(' ').map( w =>  w.substring(0,1).toUpperCase()+ w.substring(1)).join(' ')


// ******** 
// ******** Section 6: Service Layer **********
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
    const idNum = parseInt(request.params.id, 10);
    if (idNum && idNum > 0) return idNum;
    errorCourse400Error(request, response, request.params.id);
    return 0;
}

// ******** 
// ******** Section 7: Data Service Validation/Display/Handle Errors **********
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
    console.log (error);
    console.log (value);
    if (error) {
        return error;
    }
    return undefined;
}

// ******** 
// ******** Section 8: Error View (Response) Layer: Respond with 404 and 400 as needed **********
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


