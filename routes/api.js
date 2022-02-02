const e = require('express');
var express = require('express');
var pool = require('./pool')
var router = express.Router();

/* GET home page. */



router.post('/getdoctor_details', function(req, res, next) {
    if(req.body.language == 'en'){
        pool.query(`select id , english_name as doc_name from doctors where id = '${req.body.doc_id}'`,(err,result)=>{
            if(err) throw err;
            else res.json({docotordata : result})
           })
        
    }
    else {
         pool.query(`select id , arabic_name as doc_name from doctors where id = '${req.body.doc_id}'`,(err,result)=>{
            if(err) throw err;
            else res.json({docotordata : result})
           })
        }
        
  

});



router.post('/getdoctors', function(req, res, next) {
    console.log('najn',req.body)

    if(req.body.language == 'en'){
        pool.query(`select id , english_name as doc_name from doctors`,(err,result)=>{
            if(err) throw err;
            else res.json({docotordata : result})

        })
    }
    else {
        pool.query(`select id , arabic_name as doc_name from doctors`,(err,result)=>{
            if(err) throw err;
            else res.json({docotordata : result})

        })
    }
  
});



router.post('/reg_user',(req,res)=>{
    let body = req.body;
    pool.query(`insert into users set ?`,body,(err,result)=>{
        if(err) throw err;
        else res.json({
            userdata : result
        })
    })
})



router.post('/updateprofile', (req, res) => {
    pool.query(`update users set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })

            
        }
    })
    
})


router.get('/getcategory',(req,res)=>{
    pool.query(`select * from category order by category`,(err,result)=>{
        if(err) throw err;
        else res.json({categorydata:result})
    })
})



router.post('/save_my_day',(req,res)=>{
    let body = req.body;

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today = mm + '/' + dd + '/' + yyyy;

    let medications1 = req.body.medications;


    permittedValues = [];
    for (i = 0; i < medications1.length; i++){
       permittedValues[i] = medications1[i]["name"];
    }

    let medications2 = req.body.other_medications;
    let final = permittedValues.concat(medications2)
    body['medications'] = final.toString();
    body['other_medications'] = final.toString();

    body['dates'] = today;
console.log(req.body)
console.log(final.toString());
    pool.query(`insert into reports set ?`,body,(err,result)=>{
        if(err) throw err;
        else res.json({
            userdata : result
        })
    })
})






router.post('/save_das28_esr', (req, res) => {
    pool.query(`update reports set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })

            
        }
    })
    
})


router.post('/save_das28_crp', (req, res) => {
    pool.query(`update reports set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update'
            })

            
        }
    })
    
})


router.post('/save_cdai', (req, res) => {
    pool.query(`update reports set ? where id = ?`, [req.body, req.body.id], (err, result) => {
        if(err) {
            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            res.json({
                status:200,
                type : 'success',
                description:'successfully update',
                result:5.22524,
                color:'red',
                text:'perfect'
            })

            
        }
    })
    
})




router.post('/getallreportdate',(req,res)=>{
    pool.query(`select dates from reports where userid = '${req.body.userid}'`,(err,result)=>{
        if(err) throw err;
        else{
            console.log(result)
             res.json(result)
            }
    })
})




router.post('/myhistory',(req,res)=>{
    pool.query(`select r.fatigue_status as fatigue , r.medications , r.id ,  r.crp, r.crp_status , r.esr , r.esr_status , r.cdai , r.cdai_status,
    (select u.smoke_status from users u where u.id = r.userid) as smoker,
                       r.morning_stiffness as moring_stiffness, r.today_active as activity_level, r.morning_stiffness_time,
                       r.feeling_status as general_mood from reports r where r.userid = '${req.body.userid}' and r.dates = '${req.body.date}'`,(err,result)=>{
        if(err) throw err;
        else{
            
            
             res.json({my_day:result})
            }
    })
})

module.exports = router;
