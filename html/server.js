 const express = require('express');
 const bodyParser = require('body-parser');
const mysql = require('mysql');
const fs = require('fs');
const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : 'Doordie@123',
	database : 'FeedbackPortalDatabase'
});

const app = express();

app.use('/cssFiles',express.static('/home/shivam/DBMS-Project/css'));
app.use('/profiles',express.static('/home/shivam/DBMS-Project/profile'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");

connection.connect(function(err){
	if(!err) {
     console.log("Database is connected ... \n\n");  
 } else {
     console.log("Error connecting database ... \n\n");  
 }
 });

app.get('/aboutUs',(req,res)=>{
	res.render('about');
});
app.get('/contactUs',(req,res)=>{
	res.render('contact');
});

app.get('/giveContact',(req,res)=>{
	res.render('contactform');
});

app.get('/addData',(req,res) => {
	let post = {id: 1, name : 'shivam'};
	let sql = 'INSERT INTO person set ?';
	let query = connection.query(sql,post,(err,result) => {
		if(err) throw err;
		console.log(result);
		res.send('Post added');
	});

});

app.post('/saveQuery',(req,res)=>{
	res.send('Query got');
});

app.get('/getPosts',(req,res) => {
	let sql = 'select * from person';
	let query = connection.query(sql,(err,result) => {
		if(err) throw err;
		console.log(result);
		res.send('Post fetched');
	});

});

app.get('/selectpost/:id', (req,res) => {
	let sql = `select * from person where id = ${req.params.id}`;
	let query = connection.query(sql,(err,result) => {
		if(err) throw err;
		console.log(result);
		res.send('Post fetched'); 
	});
});

app.get('/updatepost/:id', (req,res) => {
	let newName = 'newName';
	let sql = `update person set name = '${newName}' WHERE id = ${req.params.id}`;
	let query = connection.query(sql,(err,result) => {
		if(err) throw err;
		console.log(result);
		res.send('Post updated'); 
	});
});

app.get ('/', function(req, res){
	res.render('login',{ret : ''});
});
app.get('/signup', function(req, res){
	res.render('signup');
});

app.post('/signup', (req,res) => {
	var email = req.body.emailid;
	var password = req.body.password;
	var type = req.body.type;
	var cpassword = req.body.cpassword;
	var first_name = req.body.first_name;
	var last_name = req.body.last_name;
	var gender = req.body.gender;
	var mobile = req.body.mobile;
	if(email.length==0 || type.length==0 || first_name.length==0 || last_name.length==0 || mobile.length==0){
		res.end("Marked fields can not be left empty.");
	}
	else if(email.search('@gmail.com')==-1&&email.search('@iiita.ac.in')==-1)
	{
		res.end("please enter valid email id");
	}
	else if(password.length <= 7 || cpassword.length <=7 || (password != cpassword)){
		if(password.length == 0|| cpassword.length==0 )
			res.end("Password fields can not be left empty");
		else if(password.length<=7 || cpassword.length<=7)
			res.end("Password must contain atleast 8 characters");
		else
			res.end("Passwords do not match");
		
	}
	else
	{
		let sql = `select * from persons where emailid = '` + email + `'`;
		let query = connection.query(sql,(err,result)=>{
		if(result.length!=0){
			res.end("User already registered");
		}
		else{
				 let entry = {emailid : email,
							 type : type,
							 firstname : first_name,
							 lastname : last_name,
							 password : password,
							 mobile : mobile,
							 gender : gender,
							 firstlogin : 'true'
				};
				let sql = 'INSERT INTO persons set ?';
				let query = connection.query(sql,entry);
				res.end('Registeration successfull,now go to login');
			}
		});
	}
});

app.post('/dashboard',(req,res) => {
	var emailid = req.body.emailid;
	var password = req.body.password;
	console.log(emailid);
	console.log(password);
	var ret;
	if(password.length==0){
		ret = "Password can not be left empty";
		res.render('login',{ret: ret});
	}
	else{
		let sql = `select * from persons where emailid = '` + emailid + `'`;
		let query = connection.query(sql,(err,result)=>{
			if(result.length==0){
				ret = 'emailid is not registered with us.';
				res.render('login',{ret : ret});
			}
			else{
				if(password == result[0].password){
					var firstname = result[0].firstname;
					var lastname = result[0].lastname;
					 if(result[0].type=='teacher'){
					 	if(result[0].firstlogin=='true'){
					 		console.log('there');
					 		console.log(firstname);
					 		console.log(lastname);
					 		res.render('dashboard_teacher',{emailid : emailid,firstLogin : result[0].firstlogin,course1:'',course2:'',firstname : firstname,
					 			lastname : lastname});
					 	}
					 	else
					 	{
					 				console.log('there2');
					 				sql = `select course from course_faculty where emailid = '` + emailid + `'`;

									connection.query(sql,(err,result)=>{
										if(err)
											throw err;
										console.log(result[0].course);
										console.log(result[1].course);
										var course1=result[0].course;
										var course2=result[1].course;
										res.render('dashboard_teacher',{emailid : emailid,firstLogin : 'false',course1:course1,course2:course2,firstname : firstname,
					 						lastname : lastname});
									});
					 	}

					 }	
					 else{
					 	if(result[0].firstlogin=='true')
							res.render('dashboard_student',{emailid : emailid,firstLogin : result[0].firstlogin,course1:'',course2:'',course3:'',firstname : firstname,
					 			lastname : lastname});
						else{
							var id = 1;
							var firstname = result[0].firstname;
							var lastname = result[0].lastname;
						    sql = `select * from student_sem_branch where emailid = '` + emailid + `'`;
						    connection.query(sql,(err,result)=>{
						    	if(err)
						    		throw err;
						    	id = result[0].sem_id;
								    sql = `select course from courses where id = ` + id;
									connection.query(sql,(err,result)=>{
										if(err)
											throw err;
										console.log(result[0].course);
										console.log(result[1].course);
										var course1=result[0].course;
										var course2=result[1].course;
										var course3=result[2].course;
										res.render('dashboard_student',{emailid : emailid,firstLogin : 'false',course1:course1,course2:course2,course3:course3,firstname: firstname,
											lastname : lastname});
									});
						    });
						}
					}
				}else{
					ret = "Password is incorrect";
					res.render('login',{ret:ret});
				}
			}
		});
	}
});


app.post("/fillSem",(req,res)=>{
	var emailid = req.body.emailid;
	var sem = req.body.CurrentSemester;
	var branch = req.body.Branch;
	var firstname;
	var lastname;
	var id;
	let sql = `select * from persons where emailid = '` + emailid + `'`;
	connection.query(sql,(err,result)=>{
	 	firstname = result[0].firstname;
	 	lastname = result[0].lastname;
	 });
	console.log(sem + ' ' + branch);
	sql = `select id from sem_branch where sem = '` + sem + `' and branch like '` + branch.charAt(0) + `%'`;
	console.log(sql);
	connection.query(sql,(err,result)=>{
		if(err)
			throw err;
		console.log(result.length);
		id = result[0].id;
		let entry = {
					emailid : emailid,
					sem_id : id
				};
				sql = 'INSERT INTO student_sem_branch set ?';
				let query = connection.query(sql,entry);
				 sql = `update persons set firstlogin = 'false' where emailid = ` + `'` +  emailid + `'`;
				connection.query(sql);
				sql = `select course from courses where id = ` + id;
				connection.query(sql,(err,result)=>{
					if(err)
						throw err;
					console.log(result[0].course);
					console.log(result[1].course);
					var course1=result[0].course;
					var course2=result[1].course;
					var course3=result[2].course;
					res.render('dashboard_student',{emailid : emailid,firstLogin : 'false',course1:course1,course2:course2,course3:course3,firstname : firstname,lastname:lastname});
				});
	});
});

app.post("/getStudentQues",(req,res)=>{
	var code = req.body.code;
	let sql = `select * from student_questions where ques_id = `  + code;
	console.log(code);

	let query = connection.query(sql,(error,result)=>{
		if(error)
			throw error;
		res.send(result[0].ques);

	});
});
app.post("/getTeacherQues",(req,res)=>{
	var code = req.body.code;
	let sql = `select * from teacher_questions where ques_id = `  + code;
	console.log(code);

	let query = connection.query(sql,(error,result)=>{
		if(error)
			throw error;
		res.send(result[0].ques);

	});
});





app.post("/fillstudentanswer",(req,res)=>{
	var code=req.body.quesno;
	var ans=req.body.Feedback;
	var emailid=req.body.emailid;
	var course = req.body.course;
	var rating = req.body.rate;
	console.log(rating);
	console.log(ans);
	 let entry ={
	 		emailid:emailid,
	 		ques_id:code,
	 		answer:ans,
	 		course : course,
	 		rating : parseInt(rating)
	 };
	let sql = `select * from student_feedback where emailid = ` + `'` + emailid  +`' and ques_id = ` + code +` and course = '` + course + `'`;
	console.log(sql);
	connection.query(sql,(error,result)=>
	{
		if(error)
			throw error;
		if(result.length==0){
			let sql = 'INSERT INTO student_feedback set ?';		
			let query = connection.query(sql,entry); 
			console.log(1+parseInt(code));
			if(1+parseInt(code)<=5)
				res.render('CourseFeedback',{emailid : emailid,course:course,curQues : 1+parseInt(code)});
			else
				res.render('CourseFeedback',{emailid : emailid,course:course,curQues : parseInt(code)});
		}else{
			let sql = `update student_feedback set answer = '` + ans + `',rating=${rating} where emailid = '` + emailid + `' and ques_id = ` + code +` and course = '` + course + `'`;
			console.log(sql); 
			let query = connection.query(sql,entry);
			console.log(1+parseInt(code));
			if(1+parseInt(code)<=5)
				res.render('CourseFeedback',{emailid : emailid,course:course,curQues : 1+parseInt(code)});
			else
				res.render('CourseFeedback',{emailid : emailid,course:course,curQues : parseInt(code)});
			}
	});

});
app.post("/fillTeacheranswer",(req,res)=>{
	var code=req.body.quesno;
	var ans=req.body.Feedback;
	var emailid=req.body.emailid;
	var course = req.body.course;
	 let entry ={
	 		emailid:emailid,
	 		ques_id:code,
	 		answer:ans,
	 		course : course
	 };
	let sql = `select * from teacher_feedback where emailid = ` + `'` + emailid  +`' and ques_id = ` + code +` and course = '` + course + `'`;
	console.log(sql);
	connection.query(sql,(error,result)=>
	{
		if(error)
			throw error;
		if(result.length==0){
			let sql = 'INSERT INTO teacher_feedback set ?';		
			let query = connection.query(sql,entry); 
			console.log(1+parseInt(code));
			if(1+parseInt(code)<=5)
				res.render('CourseFeedbackTeacher',{emailid : emailid,course:course,curQues : 1+parseInt(code)});
			else
				res.render('CourseFeedbackTeacher',{emailid : emailid,course:course,curQues : parseInt(code)});
		}else{
			let sql = `update teacher_feedback set answer = '` + ans + `' where emailid = '` + emailid + `' and ques_id = ` + code +` and course = '` + course + `'`;
			console.log(sql); 
			let query = connection.query(sql,entry);
			console.log(1+parseInt(code));
			if(1+parseInt(code)<=5)
				res.render('CourseFeedbackTeacher',{emailid : emailid,course:course,curQues : 1+parseInt(code)});
			else
				res.render('CourseFeedbackTeacher',{emailid : emailid,course:course,curQues : parseInt(code)});
			}
	});

});






app.post('/nextQues',(req,res)=>{
	var code = req.body.quesCode;
	var emailid = req.body.emailid;
	var course = req.body.course;

	if(code!='5')
		res.render('CourseFeedback',{emailid : emailid,course:course,curQues : 1+parseInt(code)});
});
app.post('/nextQuesTeacher',(req,res)=>{
	var code = req.body.quesCode;
	var emailid = req.body.emailid;
	var course = req.body.course;

	if(code!='5')
		res.render('CourseFeedbackTeacher',{emailid : emailid,course:course,curQues : 1+parseInt(code)});
});



app.post('/previousQues',(req,res)=>{
	var code = req.body.quesCode;
	var emailid = req.body.emailid;
	var course = req.body.course;
	if(code!='1')
		res.render('CourseFeedback',{emailid : emailid,course:course ,curQues : parseInt(code)-1});		
});

app.post('/previousQuesTeacher',(req,res)=>{
	var code = req.body.quesCode;
	var emailid = req.body.emailid;
	var course = req.body.course;
	if(code!='1')
		res.render('CourseFeedbackTeacher',{emailid : emailid,course:course ,curQues : parseInt(code)-1});		
});


app.post('/fetchCourse',function(req,res){
	var emailid = req.body.email;
	var course = req.body.course;
	console.log(emailid);
	console.log(course);
	res.render('CourseFeedback',{emailid:emailid,course:course,curQues : 1});
});

app.post('/fetchCourseTeacher',function(req,res){
	var emailid = req.body.email;
	var course = req.body.course;
	console.log(emailid+ 'yeh chla');
	console.log(course);
	res.render('CourseFeedbackTeacher',{emailid:emailid,course:course,curQues : 1});
});



app.post('/backDash',(req,res)=>{
	var emailid = req.body.emailid;
	var id = 1;
	let sql = `select * from persons where emailid = '` + emailid + `'`;
	var firstname;
	var lastname;
	connection.query(sql,(err,result)=>{
		firstname = result[0].firstname;
        lastname = result[0].lastname;
	});
    sql = `select * from student_sem_branch where emailid = '` + emailid + `'`;
   
    connection.query(sql,(err,result)=>{
    	if(err)
    		throw err;
    	id = result[0].sem_id;
	    sql = `select course from courses where id = ` + id;
		connection.query(sql,(err,result)=>{
			if(err)
				throw err;
			console.log(result[0].course);
			console.log(result[1].course);
			var course1=result[0].course;
			var course2=result[1].course;
			var course3=result[2].course;
			res.render('dashboard_student',{emailid : emailid,firstLogin : 'false',course1:course1,course2:course2,course3:course3,firstname : firstname,lastname : lastname});
		});
    });
});
app.post('/backDashTeacher',(req,res)=>{
	var emailid = req.body.emailid;
	var id = 1;
	let sql = `select * from persons where emailid = '` + emailid + `'`;
	var firstname;
	var lastname;
	connection.query(sql,(err,result)=>{
		firstname = result[0].firstname;
        lastname = result[0].lastname;
	});
	sql = `select course from course_faculty where emailid = '` + emailid + `'`;
	connection.query(sql,(err,result)=>{
		if(err)
			throw err;
		console.log(result[0].course);
		console.log(result[1].course);
		var course1=result[0].course;
		var course2=result[1].course;
		res.render('dashboard_teacher',{emailid : emailid,firstLogin : 'false',course1:course1,course2:course2,firstname : firstname, lastname:lastname});
	});
});





app.listen(3000, function(err, res){
	console.log("server started");
});


app.get('/showFeedback',(req,res)=>{
	var str = req._parsedUrl.query;
	var crs = parseInt(str.charAt(0));
	var code   = parseInt(str.charAt(1)); 
	var emailid = str.substr(2);
	console.log(crs + emailid);
	if(crs<=2){
		let sql = `select * from course_faculty where emailid = '${emailid}'`;
		console.log(sql);
		connection.query(sql,(err,result)=>{
			if(err)
				throw err;
			else{
				var course = result[crs-1].course;
				var question;
				sql = `select ques from student_questions where ques_id = ${code}`;
				connection.query(sql,(err,result)=>{
					question = result[0].ques;
				});
				sql = `select answer from student_feedback where ques_id = ${code} and course = '${course}'`;
				console.log(sql);
				connection.query(sql,(err,result)=>{
					if(err)
						throw err;
					else{
						res.render('feedbacks',{feedback : result,question : question,quesid:code,course:course});
					}

				});
			}
		}) ;
	}else{
		crs-=2;
		let sql = `select * from course_faculty where emailid = '${emailid}'`;
		console.log(sql);
		connection.query(sql,(err,result)=>{
			if(err)
				throw err;
			else{
				var course = result[crs-1].course;
				var question;
				sql = `select ques from teacher_questions where ques_id = ${code}`;
				connection.query(sql,(err,result)=>{
					question = result[0].ques;
				});
				sql = `select answer from teacher_feedback where ques_id = ${code} and course = '${course}'`;
				console.log(sql);
				connection.query(sql,(err,result)=>{
					if(err)
						throw err;
					else{
						res.render('feedbacks',{feedback : result,question : question,quesid:code,course:course});
					}

				});
			}
		}) ;
	}

});

app.post("/fillCourses",(req,res)=>{
	var emailid=req.body.emailid;
	var course1=req.body.CurrentCourse1;
	var course2=req.body.CurrentCourse2;
	

	let entry ={
	 		emailid:emailid,
	 		course:course1
	 };
	let sql = 'INSERT INTO course_faculty set ?';		
	let query = connection.query(sql,entry); 

	 entry ={
	 		emailid:emailid,
	 		course:course2
	 };
	 sql = 'INSERT INTO course_faculty set ?';		
	 query = connection.query(sql,entry); 

	 sql = `update persons set firstlogin = 'false' where emailid = ` + `'` +  emailid + `'`;
	 connection.query(sql);
	 sql = `select * from persons where emailid = '` + emailid + `'`;
	 connection.query(sql,(err,result)=>{
	 	var firstname = result[0].firstname;
	 	var lastname = result[0].lastname;
	 	res.render('dashboard_teacher',{emailid : emailid,firstLogin : 'false',course1:course1,course2:course2,firstname : firstname,lastname:lastname});
	 });
});


app.get('/fetchFaculty',(req,res)=>{
	var str = req._parsedUrl.query;
	var idx = str.search('&');
	var course = str.substr(0,idx);
	var emailid = str.substr(idx+1);
	console.log(course);
	console.log(emailid);
	let sql = `select emailid from course_faculty where course = '${course}' `;
	connection.query(sql,(err,result)=>{
				res.render('faculties',{emailid : emailid,course : course, faculties : result})
			});
});

app.get('/fetchmsgs',(req,res)=>{
	var str=req.url;
	var idx = str.indexOf('?');
    //var idx2=str.indexOf('');
	var emailid = str.substr(idx+1,str.length-1);
	

	console.log("Yay!!")
	console.log(str+'   '+ emailid);

	let sql = `select * from messages where receiver = '${emailid}' order by sentDate desc`;
	console.log(sql);
	connection.query(sql,(err,result)=>{
		if(err)
			throw err;
				res.render('messages',{message : result,emailid:emailid})
			});

});

app.post('/sendMessage',(req,res)=>{
	var sender = req.body.sender;
	var receiver = req.body.receiver;
	var msg = req.body.message;
	console.log(msg);
	let sql = `insert into messages (sender,receiver,message,seen) values('${sender}','${receiver}','${msg}','false')`;
	console.log(sql);
	connection.query(sql,(err,result)=>{
		if(err)
			throw err;
		else{
			res.send('success');
		}
	});
});

app.get('/sendreply',(req,res)=>{
	var str = req._parsedUrl.query;

	var idx = str.search('&');
	var sender = str.substr(0,idx);
	var receiver = str.substr(idx+1);
	console.log(str);
	console.log(sender);
	console.log(receiver);


	console.log("here.......!!");


	res.render('writereply',{sender : sender,receiver:receiver});
			

});
app.get('/fetchmsgsstudent',(req,res)=>{
	var str=req.url;
	var idx = str.indexOf('?');
    //var idx2=str.indexOf('');
	var emailid = str.substr(idx+1,str.length-1);
	

	console.log("Yay!!")
	console.log(str+'   '+ emailid);

	let sql = `select * from messages where receiver = '${emailid}' order by sentDate desc`;
	connection.query(sql,(err,result)=>{
				res.render('studentmessages',{message : result,emailid:emailid})
			});

});

app.post('/editprofile',(req,res)=>{
	var emailid = req.body.emailid;
	let sql = `select password from persons where emailid = '${emailid}'`;
	connection.query(sql,(err,result)=>{
				var password = result[0].password;
				console.log(password);
				res.render('updateprofile',{emailid : emailid,password : password});
			});
	
});


app.post('/updateprofile1', (req,res) => {
	var email = req.body.emailid;
	var password = req.body.password;
	console.log(email);
	console.log(password);
	let sql = `update persons set password = '` + password + `'where emailid = '` + email + `'`;
	connection.query(sql);
	res.send("password updated");
});

app.post('/updateprofile2', (req,res) => {
	var email = req.body.emailid;
	var mobile = req.body.contact;
	let sql = `update persons set mobile = '` + mobile + `'where emailid = '` + email + `'`;
	connection.query(sql);
	res.send("contact no updated");
});

app.post('/adminfeed',(req,res)=>{
	var emailid = req.body.email;
	var firstname = req.body.firstname;
	var lastname = req.body.lastname;
	var message = req.body.subject;
	let sql = `insert into admin_feedback values (NULL,'${firstname}','${lastname}','${emailid}','${message}')`;
	connection.query(sql);
	res.send('done');
});

app.post('/getRatings',(req,res)=>{
	var course = req.body.course;
	var quesid = req.body.quesid;
	var arr = [0,0,0,0,0];
	var i;
	let sql = `select rating,count(*) as cnt from student_feedback where ques_id = ${quesid} and course = '${course}' and rating is not null group by rating`;
	console.log(sql);
	connection.query(sql,(err,result)=>{
		if(err)
			throw err;
		for(i=0;i<result.length;i++){
			arr[parseInt(result[i].rating)-1] = result[i].cnt; 
		}
		res.send(arr);
	});
});





