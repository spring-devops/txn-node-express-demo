//This returns a function, not an object or a class
const ExpressFunction = require('express');
const mainApp = ExpressFunction();
mainApp.use(ExpressFunction.json());
//This return a Class and not a function
const MyJoiClass = require('joi');


const courses = [] ;

mainApp.get('/', (req, res) => {
    res.send("Welcome and Hello World!!!");
});

mainApp.get('/api/courses', (req, res) => {
    res.send(courses);
});

//Assume there woll be query params:

mainApp.get('/api/courses/:id/', (req, res) => {
    let courseFound = getCourseById(req, res) ;
    if (courseFound)
        res.send(courseFound);
});

mainApp.post ('/api/courses', (req, res) => {
    if (!checkCourseError(req, res)) {
        let newCourse = {
            id: courses.length + 1,
            name: req.body.cname
            //req.body.name 
        } ;
        courses.push (newCourse);
        res.send (courses) ;
    }
});

mainApp.delete ('/api/courses/:id', (req, res) => {
        let matchedC = getCourseById(req, res) ;
        if (matchedC) { 
            const index = courses.indexOf(matchedC);
            courses.splice(index, 1);
            res.send(courses);
        }
});

mainApp.put ('/api/courses/:id', (req, res) => {
    //Look up the ID 
    if (!checkCourseError(req, res)) {
        let matchedC = getCourseById(req, res) ;
        if (matchedC) {
            matchedC.name = req.body.cname;
            res.send (courses) ;
        }
    }
})

/* const {PORT = APP_PORT || 5001} = process.env;
var iHitCount = 5 ;
mainApp.listen(PORT, () => {
    console.log (`Listening on Port ${PORT} .... ${++iHitCount}`) ;
})*/

const appMainPaort = process.env.APP_MAIN_PORT || process.env.PORT || 3001;
var iHitCount = 5 ;
mainApp.listen(appMainPaort, () => {
    console.log (`Listening on Port ${appMainPaort} .... ${++iHitCount}`) ;
})

function getCourseById (request, response) {
    let validCourseId = getValidCourseId(request, response);
    if (validCourseId > 0) {
        let matchedC = courses.find(c => c.id === validCourseId);
        if (matchedC) return matchedC;
        showId404Error(request, response, request.params.id);
        return undefined;
    }
}

function getValidCourseId (request, response) {
    const idNum = parseInt(request.params.id, 10);
    if (idNum && idNum > 0) return idNum;
    showId400Error(request, response, request.params.id);
    return 0;
}

function checkCourseError (request, response) {
    let error = getCourseError(request.body) ;
    if (error) return showValue400Error(request, response, error.details[0].message);
    console.log ('checkCourseError >>>> Returning FALSE') ;
    return false;
}

//Set up JOI 
const CoursesValidationSchema = MyJoiClass.object({
    cname: MyJoiClass.string().alphanum().min(3).required()
});
function getCourseError(courseInfo) {
    let { error,value } = CoursesValidationSchema.validate(courseInfo);
    console.log (error);
    console.log (value);    
    if (error) {
        console.log('Returning Error ...') ;
        return error;
    }
    console.log ('Returning undefined');
    return undefined;
}

function showValue400Error(request, response, error) {
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(400).send(`Error in ${request.method} request: ${error}`);
    console.log ('checkCourseError >>>> Returning TRUE') ;
    return true;
}

function showId404Error(request, response, id) {
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(404).send(`For ${request.method} request, unable to locate record with ID : ${id}`);
    return true;
}

function showId400Error(request, response, id) {
    //response.status(400).send(`Error in PUT body: ${putErrors.details[0].message}`);
    response.status(400).send(`For ${request.method} request, Invalid ID : ${id}`);
    return true;
}
