const db = require('../models/userInfoModels');
//const { ResolvePlugin } = require('webpack')
const userController = {};

// The model represents any data that may be seen / used / processed, such as data from a database (more on this later!)
// The view represents the application’s UI which renders the data from the model in a user-friendly interface
// The controller represents the connection between the model and the view, handling any processing of information back and forth
/*
Controllers Needed:
    1. CreateUser (Register)
    2. Login
    3. Edit Profile
    4. Delete Profile
    5. Search
*/

/*
CREATE TABLE user_info (
    id SERIAL PRIMARY KEY,
    username varchar(255),
    password varchar(255),
    name varchar(255),
    home varchar(255),
    email varchar(255),
    type varchar(255)
)
;

dummy instance: 
{"username": "test", "password": "test2", "name": "t1", "home": "home1", "email": "jerkface1@jerk.edu", "type": "traveler" }
*/

userController.findUsers = (req, res, next) => {
    const query = `SELECT * FROM user_info WHERE home='${req.body.home}';`;
    db.query(query).then(data => {
        if (data.rows.length > 0){
            res.locals.searchResults = data.rows;
            return next()
        } else next({
            log: 'No one matched your results',
            status: 400,
            message: {
                err: 'No one matched your results.'
            }
        })
    })
}

userController.createUser = (req, res, next) => {
    const query = `INSERT INTO user_info (username, password, name, home, email, type)
     SELECT '${req.body.username}', '${req.body.password}', '${req.body.name}', '${req.body.home}', '${req.body.email}', '${req.body.type}'
     WHERE NOT EXISTS (SELECT username, password, name, home, email, type FROM user_info WHERE username='${req.body.username}' OR email='${req.body.email}')
     RETURNING username, password, name, home, email, type;`;

    db.query(query).then(data => {
        if (data.rows.length > 0) {
            res.locals.user = data.rows[0];
            return next();
        } else(next({
                log: 'There is a duplicate value for username or email.',
                status: 400,
                message: {
                    err: 'There is a duplicate value for username or email.'
                }
            })).catch(err => {
                console.log("Error in userController.createUser: " , err);
                return next(err);
            } )
    });
}

userController.login = (req, res, next) => {
    //req -> matching username and paxwssword with data from database
    // console.log("req.body in userController: ", req);
    let {
        username,
        password
    } = req.body
    // let arr = [username, password];
    const query = `SELECT * FROM user_info WHERE username='${username}' AND password='${password}';`;

    db.query(query).then(data => {
        if (data.rows.length > 0) {
            res.locals.user = data.rows[0];
            return next();
        } else(next({
            log: 'user does not exist',
            status: 400,
            message: {
                err: 'user does not exist'
            }
        }))
    }).catch(err => {
        console.log("Error in userController.createUser: ", err);
        return next(err);
    })
    //res -> would be every column (data) from that user. 
}

userController.getProfile = (req, res, next) => {
    console.log("Inside userController.getProfile.");
    const query = `SELECT * FROM user_info WHERE id='${req.params.id}';`;
    db.query(query).then(data => {
        res.locals.user = data.rows;
        return next()
    }).catch(err => {
        console.log("Error in userController.getProfile: ", err);
        return next(err);
    })
}

userController.deleteProfile = (req, res, next) => {
    console.log("Inside userController.deleteProfile.")
    const query = `DELETE FROM user_info WHERE id='${req.params.id}';`;
    db.query(query).then(data => {
        console.log("Deleting User's information");
        return next();
    }).catch(err => {
        console.log("Error in userController.getProfile: ", err);
        return next(err);
    })
}

userController.updateProfile = (req, res, next) => {
    console.log("Inside userController.updateProfile")
        const allKeys = Object.keys(req.body);
        const allValues =  Object.values(req.body);

        for (let i = 0; i < allKeys.length; i++){
            let query = `UPDATE user_info SET ${allKeys[i]} = '${allValues[i]}' WHERE id='${req.params.id}'`

            db.query(query).then(data => {
                res.locals.user = data.rows;
                return next()
            }).catch(err => {
                console.log("Error in userController.updateProfile", err);
                return next(err)
            })
        }
}

module.exports = userController;