const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const fs = require('fs');
const app = express();
const hbs = require('hbs');

const helpers = require('./utils/hbsHelpers');
const getDuration = require('./utils/getDuration');
const formatLongDate = require('./utils/formatLongDate');
const db = require('./connection/db');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: './public/data/uploads/',
    filename: function (req, file, cb) {
        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage });
const PORT = '5000';

let urlAdd = false;

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
    session({
        secret: 'rahasia',
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 1000 * 60 * 60 * 2 },
    })
);

// hbs config
hbs.registerPartials(path.join(__dirname, 'views', 'partials'), (err) => {

});

hbs.registerHelper({ ifCond: helpers.ifCond });

// setup engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use('/public', express.static(path.join(__dirname, 'public')));


// GET
app.get('/', async (req, res) => {
    db.connect((err, client, done) => {
        if (err) throw err;
        const query = 'SELECT * FROM tb_projects ORDER BY id DESC';
        client.query(query, (err, result) => {
            if (err) throw err;
            done();
            let dataProjects = result.rows.map((project) => (
                {
                    ...project,
                    description: project.description.substring(1, 50),
                    duration: getDuration(project.end_date, project.start_date)
                }
            ));

            res.render('home', { title: 'Home', projects: dataProjects, isLogin: req.session.isLogin, user: req.session.user, });
        });

    })


});
// GET SINGLE PROJECT
app.get('/project-detail/:id', (req, res) => {
    let id = req.params.id;

    db.connect((err, client, done) => {
        if (err) throw err;
        const query = `SELECT * FROM tb_projects WHERE id=${id}`;
        client.query(query, (err, result) => {
            if (err) throw err;
            let project = result.rows[0];
            done();
            project = {
                ...project,
                duration: getDuration(project.end_date, project.start_date),
                startdate: formatLongDate(project.start_date),
                enddate: formatLongDate(project.end_date),
            }

            res.render('project-detail', { project, isLogin: req.session.isLogin, user: req.session.user, });
        });
    })
})

// ADD PROJECT
app.get('/add-project', (req, res, next) => {
    if (!req.session.isLogin) {
        req.flash('error', 'Please Login before you add post');
        urlAdd = true;
        return res.redirect('/login');
    }
    res.render('add-project', { title: 'Add Project', isLogin: req.session.isLogin, user: req.session.user, });

});

// POST PROJECT
app.post('/add-project', upload.single('image'), (req, res) => {
    let project = req.body;
    const isSomeEmpty = Object.values(project).some(value => value === '' || value.length === 0);
    const isTechonlogies = project.technologies;

    if (isSomeEmpty || isTechonlogies === undefined) {
        req.flash('error', 'please fill in all fields');
        return res.render('add-project', { title: 'Add Project', project, isLogin: req.session.isLogin, user: req.session.user, });
    } else {
        if (project.startdate > project.enddate) {
            req.flash('error', 'end date must greater than start date! ');
            return res.render('add-project', { title: 'Add Project', project, isLogin: req.session.isLogin, user: req.session.user, });
        }
        if (!req.file) {
            req.flash('error', 'please select an image');
            res.render('add-project', { title: 'Add Project', project, isLogin: req.session.isLogin, user: req.session.user, });
            return;
        } else {
            project.image = req.file.filename;
        }

        if (!Array.isArray(project.technologies)) {
            project.technologies = [project.technologies];
        }
    }

    let queryArray = '';
    project.technologies.forEach((tech) => queryArray += `'${tech}',`);
    queryArray = queryArray.substring(queryArray.length - 1, 1);
    db.connect((err, client, done) => {
        if (err) throw err;
        const query = `INSERT INTO tb_projects (name, start_date, end_date, description, technologies, image) VALUES (
            '${project.name}',
            '${project.startdate}',
            '${project.enddate}',
            '${project.description}',
            ARRAY ['${queryArray}],
            '${project.image}')`;

        client.query(query, (err, result) => {
            if (err) throw err;
            done();
            req.flash('success', 'Project has been added successfuly!')
            res.redirect('/');
        });
    })
})

// EDIT PROJECT
app.get('/edit-project/:id', (req, res) => {
    if (!req.session.isLogin) {
        return res.redirect('/');
    }

    const id = req.params.id;
    db.connect((err, client, done) => {
        if (err) throw err;

        const query = `SELECT * FROM tb_projects WHERE id=${id}`;
        client.query(query, (err, result) => {
            if (err) throw err;
            let project = result.rows[0];
            done();
            project = {
                ...project,
                start_date: new Date(project.start_date).toLocaleDateString('en-GB').split('/').reverse().join('-'),
                end_date: new Date(project.end_date).toLocaleDateString('en-GB').split('/').reverse().join('-'),
            };
            // transform tech array tobe object
            let technologies = [];
            project.technologies.forEach((tech) => (
                technologies[tech] = true
            ))
            res.render('edit-project', { title: 'Edit Project', project, technologies, isLogin: req.session.isLogin, user: req.session.user, });
        });
    })

});
app.post('/edit-project/:id', upload.single('image'), (req, res) => {

    let project = req.body;
    const id = +req.params.id;
    const isSomeEmpty = Object.values(project).some(value => value === '');
    const isTechonlogies = project.technologies;
    if (isSomeEmpty || isTechonlogies === undefined) {
        req.flash('error', 'fill in all fields');
        return res.redirect(`/edit-project/${id}`);
    } else {
        if (project.startdate > project.enddate) {
            req.flash('error', 'end date must greater than start date! ');
            return res.redirect(`/edit-project/${id}`);
        }
        if (!Array.isArray(project.technologies)) {
            project.technologies = [project.technologies];
        }
    }

    let queryArray = '';
    project.technologies.forEach((tech) => queryArray += `'${tech}',`);
    queryArray = queryArray.substring(queryArray.length - 1, 1);

    db.connect((err, client, done) => {
        if (err) throw err;
        let queryImage = '';
        let currentFile = '';

        client.query(`SELECT image FROM tb_projects WHERE id=${id}`, (err, result) => {
            if (err) throw err;
            currentFile = result.rows[0].image;

        });

        if (req.file) {
            queryImage = `,image = '${req.file.filename}'`;
        };


        const queryUpdate = `UPDATE tb_projects SET
            name ='${project.name}',
            start_date ='${project.startdate}',
            end_date = '${project.enddate}',
            description = '${project.description}',
            technologies = ARRAY ['${queryArray}] 
            ${queryImage !== '' ? queryImage : ''}
            WHERE id=${id}`;
        client.query(queryUpdate, (err, result) => {
            if (err) throw err;
            done();


            if (queryImage) {
                if (fs.existsSync(path.join(__dirname, 'public/data/uploads', currentFile))) {
                    fs.unlinkSync(path.join(__dirname, 'public/data/uploads', currentFile));
                }
            };
            req.flash('success', 'Project has been edited successfuly!');
            res.redirect('/');
        });
    })

});

// DELETE

app.get('/delete-project/:id', (req, res) => {
    if (!req.session.isLogin) {
        req.flash('error', 'Please Login before you Delete');
        return res.redirect('/login');
    }
    const id = +req.params.id;

    db.connect((err, client, done) => {
        let currentFile = '';
        client.query(`SELECT image FROM tb_projects WHERE id=${id}`, (err, result) => {
            if (err) throw err;
            if (result.rows.length > 0) {
                currentFile = result.rows[0].image;
            }
        });
        const query = `DELETE FROM tb_projects WHERE id=${id}`;
        client.query(query, (err, result) => {
            if (err) throw err;
            done();
            if (fs.existsSync(path.join(__dirname, 'public/data/uploads', currentFile))) {
                fs.unlinkSync(path.join(__dirname, 'public/data/uploads', currentFile), () => {
                });
            }
            req.flash('success', 'Project has been deleted!');
            res.redirect('/');
        });

    });
})


// AUTHETICATION
app.get('/login', (req, res) => {
    if (req.session.isLogin) {
        return res.redirect('/');
    }
    res.render('login', { title: 'Login' });
});

app.post('/login', (req, res) => {
    const user = req.body;

    if (user.email == '' || user.password == '') {
        req.flash('error', 'Please insert all field!');
        return res.redirect('/login');
    }

    db.connect((err, client, done) => {
        if (err) throw err;

        const query = `SELECT * FROM tb_user WHERE email = '${user.email}'`;

        client.query(query, function (err, result) {
            if (err) throw err;

            // Check account by email
            if (result.rows.length == 0) {
                req.flash('error', 'Password or Email is Wrong!');
                return res.redirect('/login');
            }

            // Check password
            const isMatch = bcrypt.compareSync(
                user.password,
                result.rows[0].password
            );

            if (isMatch == false) {
                req.flash('error', 'Password or Email is Wrong!');
                return res.redirect('/login');
            }

            req.session.isLogin = true;
            req.session.user = {
                id: result.rows[0].id,
                email: result.rows[0].email,
                name: result.rows[0].name,
            };
            if (urlAdd) {
                res.redirect('/add-project');
                urlAdd = false;
            } else {
                res.redirect('/');
            }

        });
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});





app.get('/register', (req, res) => {
    if (req.session.isLogin) {
        return res.redirect('/');
    }
    res.render('register', { title: 'Register', isLogin: req.session.isLogin, user: req.session.user, });
})
app.post('/register', (req, res) => {
    const user = req.body;
    console.log(user);
    if (user.name == '' || user.email == '' || user.password == '') {
        req.flash('error', 'Please Fill All Fields!');
        return res.redirect('/register');

    }

    db.connect((err, client, done) => {
        if (err) {
            throw err;
        }
        // check if email is existing
        user.email = user.email.toLowerCase();

        client.query(`SELECT email FROM tb_user WHERE email='${user.email}'`, (err, result) => {

            if (result.rows.length > 0) {
                req.flash('error', 'Email Already exist!');
                return res.redirect('/register');
            } else {
                const hashedPassword = bcrypt.hashSync(user.password, 10);
                const queryregisterUser = ` INSERT INTO tb_user(name, email, password) VALUES(
                    '${user.name}',
                    '${user.email}',
                    '${hashedPassword}');`;

                client.query(queryregisterUser, (err, result) => {
                    if (err) throw err;
                    if (result.rows) {
                        console.log(result.rows);
                        req.flash('success', 'register success, please login');
                        res.redirect('/login');
                    }

                })
            }
        });


    });



})


app.get('/contact-me', (req, res) => {
    res.render('contact-me', { title: 'Contact' });
});

app.get('*', function (req, res) {
    res.render('not-found.hbs', { title: 'Page not found', isLogin: req.session.isLogin, user: req.session.user, });
});

app.listen(PORT, () => {
    console.log(`Server starting on PORT: ${PORT}`);
});

