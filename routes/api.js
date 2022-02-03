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
    
    today = yyyy + '-' + mm + '-' + dd;

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

   pool.query(`select * from reports where dates = '${today}' and userid = '${req.body.userid}' `,(err,result)=>{
       if(err) throw err;
       else if(result[0]){
        pool.query(`update reports set ? where userid = ? `, [req.body, req.body.userid  ], (err, result) => {

            if(err) throw err;
            else res.json({
                userdata : result
            })
        }) 
       }
       else {
        pool.query(`insert into reports set ?`,body,(err,result)=>{
            if(err) throw err;
            else res.json({
                userdata : result
            })
        })
       }
   })

 
})






router.post('/save_das28_esr', (req, res) => {
    let body = req.body;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today = yyyy + '-' + mm + '-' + dd;
    console.log(req.body)

    pool.query(`select * from reports where dates = '${today}' and userid = '${req.body.userid}'`,(err,result)=>{
      if(err) throw err;
      else if(result[0]){
        body['esr'] = 0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.014*(+req.body.patient_g_activity)+0.70*(+req.body.esr);

        if(req.body.language == 'en'){
            if(req.body.esr < 2.6){
                body['esr_status'] = 'Disease in Remission';
                body['esr_color'] = 'green';
        
                
            } 
            else if(req.body.esr > 2.6){
                body['esr_status'] = 'Low Disease Activity';
                body['esr_color'] = 'yellow';
        
            } 
            else if(req.body.esr > 3.2){
                body['esr_status'] = 'Moderate Disease Activity';
                body['esr_color'] = 'lightred';
        
            } 
            else if(req.body.esr > 5.1){
                body['esr_status'] = 'High Disease Activity';
                body['esr_color'] = 'red';
        
            } 
        }
        else {
            if(req.body.esr < 2.6){
                body['esr_status'] = 'المرض ساكن (غير نشط)';
                body['esr_color'] = 'green';
        
                
            } 
            else if(req.body.esr > 2.6){
                body['esr_status'] = 'Low نشاط المرض';
                body['esr_color'] = 'yellow';
        
            } 
            else if(req.body.esr > 3.2){
                body['esr_status'] = 'Moderate نشاط المرض';
                body['esr_color'] = 'lightred';
        
            } 
            else if(req.body.esr > 5.1){
                body['esr_status'] = 'High نشاط المرض';
                body['esr_color'] = 'red';
        
            } 
        }
    
    
        console.log(req.body)
    
        pool.query(`update reports set ? where userid = ? and dates = '${today}'`, [req.body, req.body.userid  ], (err, result) => {
         
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
                    result:req.body.esr,
                    color:req.body.esr_color,
                    text:req.body.esr_status
                })
    
                
            }
        })
      }
      else {
        body['esr'] = 0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.014*(+req.body.patient_g_activity)+0.70*(+req.body.esr);

        if(req.body.language == 'en'){
            if(req.body.esr < 2.6){
                body['esr_status'] = 'Disease in Remission';
                body['esr_color'] = 'green';
        
                
            } 
            else if(req.body.esr > 2.6){
                body['esr_status'] = 'Low Disease Activity';
                body['esr_color'] = 'yellow';
        
            } 
            else if(req.body.esr > 3.2){
                body['esr_status'] = 'Moderate Disease Activity';
                body['esr_color'] = 'lightred';
        
            } 
            else if(req.body.esr > 5.1){
                body['esr_status'] = 'High Disease Activity';
                body['esr_color'] = 'red';
        
            } 
        }
        else {
            if(req.body.esr < 2.6){
                body['esr_status'] = 'المرض ساكن (غير نشط)';
                body['esr_color'] = 'green';
        
                
            } 
            else if(req.body.esr > 2.6){
                body['esr_status'] = 'Low نشاط المرض';
                body['esr_color'] = 'yellow';
        
            } 
            else if(req.body.esr > 3.2){
                body['esr_status'] = 'Moderate نشاط المرض';
                body['esr_color'] = 'lightred';
        
            } 
            else if(req.body.esr > 5.1){
                body['esr_status'] = 'High نشاط المرض';
                body['esr_color'] = 'red';
        
            } 
        }
       body['dates'] = today;
    
        console.log(req.body)
    
        pool.query(`insert into reports set ?`,body, (err, result) => {

         
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
                    result:req.body.esr,
                    color:req.body.esr_color,
                    text:req.body.esr_status
                })
    
                
            }
        })
      }

    })

   
    
})


router.post('/save_das28_crp', (req, res) => {
    let body = req.body;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today = yyyy + '-' + mm + '-' + dd;


 
    pool.query(`select * from reports where dates = '${today}' and userid = '${req.body.userid}'`,(err,result)=>{
     if(err) throw err;
     else if(result[0]){
        body['crp'] = 0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.014*(+req.body.patient_g_activity)+0.36*(+req.body.crp+1)+0.96;


        if(req.body.language == 'en'){
            if(req.body.crp < 2.6){
                body['crp_status'] = 'Disease in Remission';
                body['crp_color'] = 'green';
        
                
            } 
            else if(req.body.crp > 2.6){
                body['crp_status'] = 'Low Disease Activity';
                body['crp_color'] = 'yellow';
        
            } 
            else if(req.body.crp > 3.2){
                body['crp_status'] = 'Moderate Disease Activity';
                body['crp_color'] = 'lightred';
        
            } 
            else if(req.body.crp > 5.1){
                body['crp_status'] = 'High Disease Activity';
                body['crp_color'] = 'red';
        
            } 
        }
        else {
            if(req.body.crp < 2.6){
                body['crp_status'] = 'المرض ساكن (غير نشط)';
                body['crp_color'] = 'green';
        
                
            } 
            else if(req.body.crp > 2.6){
                body['crp_status'] = 'Low نشاط المرض';
                body['crp_color'] = 'yellow';
        
            } 
            else if(req.body.crp > 3.2){
                body['crp_status'] = 'Moderate نشاط المرض';
                body['crp_color'] = 'lightred';
        
            } 
            else if(req.body.crp > 5.1){
                body['crp_status'] = 'High نشاط المرض';
                body['crp_color'] = 'red';
        
            } 
        }
    
        console.log(req.body)
    
        pool.query(`update reports set ? where userid = ? and dates = '${today}'`, [req.body, req.body.userid  ], (err, result) => {
         
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
                    result:req.body.crp,
                    color:req.body.crp_color,
                    text:req.body.crp_status
                })
    
                
            }
        })
     }
     else{

        body['crp'] = 0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.014*(+req.body.patient_g_activity)+0.36*(+req.body.crp+1)+0.96;


        if(req.body.language == 'en'){
            if(req.body.crp < 2.6){
                body['crp_status'] = 'Disease in Remission';
                body['crp_color'] = 'green';
        
                
            } 
            else if(req.body.crp > 2.6){
                body['crp_status'] = 'Low Disease Activity';
                body['crp_color'] = 'yellow';
        
            } 
            else if(req.body.crp > 3.2){
                body['crp_status'] = 'Moderate Disease Activity';
                body['crp_color'] = 'lightred';
        
            } 
            else if(req.body.crp > 5.1){
                body['crp_status'] = 'High Disease Activity';
                body['crp_color'] = 'red';
        
            } 
        }
        else {
            if(req.body.crp < 2.6){
                body['crp_status'] = 'المرض ساكن (غير نشط)';
                body['crp_color'] = 'green';
        
                
            } 
            else if(req.body.crp > 2.6){
                body['crp_status'] = 'Low نشاط المرض';
                body['crp_color'] = 'yellow';
        
            } 
            else if(req.body.crp > 3.2){
                body['crp_status'] = 'Moderate نشاط المرض';
                body['crp_color'] = 'lightred';
        
            } 
            else if(req.body.crp > 5.1){
                body['crp_status'] = 'High نشاط المرض';
                body['crp_color'] = 'red';
        
            } 
        }
    
        console.log(req.body)

        body['dates'] = today
    
        pool.query(`insert into reports set ?`,body, (err, result) => {

         
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
                    result:req.body.crp,
                    color:req.body.crp_color,
                    text:req.body.crp_status
                })
    
                
            }
        })


     }

    })

    
    
})


router.post('/save_cdai', (req, res) => {
    let body = req.body;
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
    today = yyyy + '-' + mm + '-' + dd;

    pool.query(`select * from reports where dates = '${today}' and userid = '${req.body.userid}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){

            body['cdai'] = ((+req.body.tjc)+ (+req.body.sjc) + (+req.body.provider_g_activity) + (+req.body.patient_g_activity));


    if(req.body.language == 'en'){
        if(req.body.cdai < 2.8){
            body['cdai_status'] = 'Disease in Remission';
            body['cdai_color'] = 'green';
    
            
        } 
        else if(req.body.cdai > 2.8){
            body['cdai_status'] = 'Low Disease Activity';
            body['cdai_color'] = 'yellow';
    
        } 
        else if(req.body.cdai > 10){
            body['cdai_status'] = 'Moderate Disease Activity';
            body['cdai_color'] = 'lightred';
    
        } 
        else if(req.body.cdai > 22){
            body['cdai_status'] = 'High Disease Activity';
            body['cdai_color'] = 'red';
    
        } 
    }
    else {
        if(req.body.cdai < 2.8){
            body['cdai_status'] = 'المرض ساكن (غير نشط)';
            body['cdai_color'] = 'green';
    
            
        } 
        else if(req.body.cdai > 2.8){
            body['cdai_status'] = 'Low نشاط المرض';
            body['cdai_color'] = 'yellow';
    
        } 
        else if(req.body.cdai > 10){
            body['cdai_status'] = 'Moderate نشاط المرض';
            body['cdai_color'] = 'lightred';
    
        } 
        else if(req.body.cdai > 22){
            body['cdai_status'] = 'High نشاط المرض';
            body['cdai_color'] = 'red';
    
        } 
    }

    

    console.log(req.body)

    pool.query(`update reports set ? where userid = ? and dates = '${today}'`, [req.body, req.body.userid  ], (err, result) => {


        if(err) {
            console.log(err)

            res.json({
                status:500,
                type : 'error',
                description:err
            })
        }
        else {
            console.log(result)
            res.json({
                status:200,
                type : 'success',
                description:'successfully update',
                result:req.body.cdai,
                color:req.body.cdai_color,
                text:req.body.cdai_status
            })

            
        }
    })
    

        }
        else {

            body['cdai'] = ((+req.body.tjc)+ (+req.body.sjc) + (+req.body.provider_g_activity) + (+req.body.patient_g_activity));


            if(req.body.language == 'en'){
                if(req.body.cdai < 2.8){
                    body['cdai_status'] = 'Disease in Remission';
                    body['cdai_color'] = 'green';
            
                    
                } 
                else if(req.body.cdai > 2.8){
                    body['cdai_status'] = 'Low Disease Activity';
                    body['cdai_color'] = 'yellow';
            
                } 
                else if(req.body.cdai > 10){
                    body['cdai_status'] = 'Moderate Disease Activity';
                    body['cdai_color'] = 'lightred';
            
                } 
                else if(req.body.cdai > 22){
                    body['cdai_status'] = 'High Disease Activity';
                    body['cdai_color'] = 'red';
            
                } 
            }
            else {
                if(req.body.cdai < 2.8){
                    body['cdai_status'] = 'المرض ساكن (غير نشط)';
                    body['cdai_color'] = 'green';
            
                    
                } 
                else if(req.body.cdai > 2.8){
                    body['cdai_status'] = 'Low نشاط المرض';
                    body['cdai_color'] = 'yellow';
            
                } 
                else if(req.body.cdai > 10){
                    body['cdai_status'] = 'Moderate نشاط المرض';
                    body['cdai_color'] = 'lightred';
            
                } 
                else if(req.body.cdai > 22){
                    body['cdai_status'] = 'High نشاط المرض';
                    body['cdai_color'] = 'red';
            
                } 
            }
                 body['dates'] = today;
            
        
            console.log(req.body)
        
            pool.query(`insert into reports set ?`,body, (err, result) => {
                if(err) {
                    console.log(err)
        
                    res.json({
                        status:500,
                        type : 'error',
                        description:err
                    })
                }
                else {
                    console.log(result)
                    res.json({
                        status:200,
                        type : 'success',
                        description:'successfully update',
                        result:req.body.cdai,
                        color:req.body.cdai_color,
                        text:req.body.cdai_status
                    })
        
                    
                }
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



router.post('/getdatebyreport',(req,res)=>{
    pool.query(`select dates from reports where userid = '${req.body.userid}'`,(err,result)=>{
        if(err) throw err;
        else{

            permittedValues = [];
            for (i = 0; i < result.length; i++){
                result[i] = result[i]["dates"];
            }
            console.log('dd',result)
             res.json(result)
            }
    })
})


router.post('/check-date',(req,res)=>{
    pool.query(`select * from reports where dates = '${req.body.date}' and userid = '${req.body.userid}'`,(err,result)=>{
        if(err) throw err;
        else if(result[0]){
          res.json({
              msg : 'success'
          })
        }
        else{
            res.json({
                msg : 'failed'
            })
        }
    })
})


module.exports = router;
