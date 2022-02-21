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
        body['esr'] = 0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.014*(+req.body.patient_g_activity)+0.70*Math.log(+req.body.esr);

        if(req.body.language == 'en'){
            if((+req.body.esr) <= 2.6){
                body['esr_status'] = 'Disease in Remission';
                body['esr_color'] = 'green';
        
                
            } 
            else if((+req.body.esr) >= 2.6 && (+req.body.esr) > 3.19){
                body['esr_status'] = 'Low Disease Activity';
                body['esr_color'] = 'yellow';
        
            } 
            else if((+req.body.esr) >= 3.2 && (+req.body.esr) > 5.09){
                body['esr_status'] = 'Moderate Disease Activity';
                body['esr_color'] = 'pink';
        
            } 
            else if((+req.body.esr) >= 5.1){
                body['esr_status'] = 'High Disease Activity';
                body['esr_color'] = 'red';
        
            } 
        }
        else {
            if((+req.body.esr) <= 2.6){
                body['esr_status'] = 'المرض ساكن (غير نشط)';
                body['esr_color'] = 'green';
        
                
            } 
            else if((+req.body.esr) >= 2.6 && (+req.body.esr) > 3.19){
                body['esr_status'] = 'Low نشاط المرض';
                body['esr_color'] = 'yellow';
        
            } 
            else if((+req.body.esr) >= 3.2 && (+req.body.esr) > 5.09 ){
                body['esr_status'] = 'Moderate نشاط المرض';
                body['esr_color'] = 'pink';
        
            } 
            else if((+req.body.esr) >= 5.1){
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
        body['esr'] = 0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.014*(+req.body.patient_g_activity)+0.70*Math.log(+req.body.esr);


        if(req.body.language == 'en'){
            if((+req.body.esr) <= 2.6){
                body['esr_status'] = 'Disease in Remission';
                body['esr_color'] = 'green';
        
                
            } 
            else if((+req.body.esr) >= 2.6  && (+req.body.esr) > 3.19){
                body['esr_status'] = 'Low Disease Activity';
                body['esr_color'] = 'yellow';
        
            } 
            else if((+req.body.esr) >= 3.2 && (+req.body.esr) > 5.09){
                body['esr_status'] = 'Moderate Disease Activity';
                body['esr_color'] = 'pink';
        
            } 
            else if((+req.body.esr) >= 5.1){
                body['esr_status'] = 'High Disease Activity';
                body['esr_color'] = 'red';
        
            } 
        }
        else {
            if((+req.body.esr) <= 2.6){
                body['esr_status'] = 'المرض ساكن (غير نشط)';
                body['esr_color'] = 'green';
        
                
            } 
            else if((+req.body.esr) >= 2.6 && (+req.body.esr) > 3.19){
                body['esr_status'] = 'Low نشاط المرض';
                body['esr_color'] = 'yellow';
        
            } 
            else if((+req.body.esr) >= 3.2 && (+req.body.esr) > 5.09){
                body['esr_status'] = 'Moderate نشاط المرض';
                body['esr_color'] = 'pink';
        
            } 
            else if((+req.body.esr) >= 5.1){
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
        body['crp'] = 0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.36*Math.log(+req.body.crp+1)+0.014*(+req.body.patient_g_activity)+0.96;

        console.log('and',0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.36*Math.log(+req.body.crp+1)+0.014*(+req.body.patient_g_activity)+0.96)

        if(req.body.language == 'en'){
            if((+req.body.crp) <= 2.6){
                body['crp_status'] = 'Disease in Remission';
                body['crp_color'] = 'green';
        
                
            } 
            else if((+req.body.crp) >= 2.6 && (+req.body.crp) <3.19){
                body['crp_status'] = 'Low Disease Activity';
                body['crp_color'] = 'yellow';
        
            } 
            else if((+req.body.crp) >= 3.2 && (+req.body.crp) <5.09){
                body['crp_status'] = 'Moderate Disease Activity';
                body['crp_color'] = 'pink';
        
            } 
            else if((+req.body.crp) >= 5.1){
                body['crp_status'] = 'High Disease Activity';
                body['crp_color'] = 'red';
        
            } 
        }
        else {
            if((+req.body.crp) <= 2.6){
                body['crp_status'] = 'المرض ساكن (غير نشط)';
                body['crp_color'] = 'green';
        
                
            } 
            else if((+req.body.crp) >= 2.6 && (+req.body.crp) <3.19){
                body['crp_status'] = 'Low نشاط المرض';
                body['crp_color'] = 'yellow';
        
            } 
            else if((+req.body.crp) >= 3.2 && (+req.body.crp) <5.09){
                body['crp_status'] = 'Moderate نشاط المرض';
                body['crp_color'] = 'pink';
        
            } 
            else if((+req.body.crp) >= 5.1){
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

        body['crp'] = 0.56*Math.sqrt(+req.body.tjc) +0.28*Math.sqrt(+req.body.sjc)+0.36*Math.log(+req.body.crp+1)+0.014*(+req.body.patient_g_activity)+0.96;
       

        if(req.body.language == 'en'){
            if(req.body.crp <= 2.6){
                body['crp_status'] = 'Disease in Remission';
                body['crp_color'] = 'green';
        
                
            } 
            else if(req.body.crp >= 2.6 && (+req.body.crp) <3.19 ){
                body['crp_status'] = 'Low Disease Activity';
                body['crp_color'] = 'yellow';
        
            } 
            else if(req.body.crp >= 3.2 && (+req.body.crp) <5.09){
                body['crp_status'] = 'Moderate Disease Activity';
                body['crp_color'] = 'pink';
        
            } 
            else if(req.body.crp >= 5.1){
                body['crp_status'] = 'High Disease Activity';
                body['crp_color'] = 'red';
        
            } 
        }
        else {
            if(req.body.crp <= 2.6){
                body['crp_status'] = 'المرض ساكن (غير نشط)';
                body['crp_color'] = 'green';
        
                
            } 
            else if(req.body.crp >= 2.6 && (+req.body.crp) <3.19){
                body['crp_status'] = 'Low نشاط المرض';
                body['crp_color'] = 'yellow';
        
            } 
            else if(req.body.crp >= 3.2 && (+req.body.crp) <5.09){
                body['crp_status'] = 'Moderate نشاط المرض';
                body['crp_color'] = 'pink';
        
            } 
            else if(req.body.crp >= 5.1){
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
        if((+req.body.cdai) <= 2.8 ){
            body['cdai_status'] = 'Disease in Remission';
            body['cdai_color'] = 'green';
    
            
        } 
        else if((+req.body.cdai) >= 2.8 && (+req.body.cdai) <9.9){
            body['cdai_status'] = 'Low Disease Activity';
            body['cdai_color'] = 'yellow';
    
        } 
        else if((+req.body.cdai) >= 10 && (+req.body.cdai) <21.9){
            body['cdai_status'] = 'Moderate Disease Activity';
            body['cdai_color'] = 'pink';
    
        } 
        else if((+req.body.cdai) >= 22){
            body['cdai_status'] = 'High Disease Activity';
            body['cdai_color'] = 'red';
    
        } 
    }
    else {
        if((+req.body.cdai) <= 2.8){
            body['cdai_status'] = 'المرض ساكن (غير نشط)';
            body['cdai_color'] = 'green';
    
            
        } 
        else if((+req.body.cdai) >= 2.8 && (+req.body.cdai) <9.9){
            body['cdai_status'] = 'Low نشاط المرض';
            body['cdai_color'] = 'yellow';
    
        } 
        else if((+req.body.cdai) >= 10 && (+req.body.cdai) <21.9){
            body['cdai_status'] = 'Moderate نشاط المرض';
            body['cdai_color'] = 'pink';
    
        } 
        else if((+req.body.cdai) >= 22){
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
                if(req.body.cdai <= 2.8){
                    body['cdai_status'] = 'Disease in Remission';
                    body['cdai_color'] = 'green';
            
                    
                } 
                else if(req.body.cdai >= 2.8 && (+req.body.cdai) <9.9){
                    body['cdai_status'] = 'Low Disease Activity';
                    body['cdai_color'] = 'yellow';
            
                } 
                else if(req.body.cdai >= 10 && (+req.body.cdai) <21.9){
                    body['cdai_status'] = 'Moderate Disease Activity';
                    body['cdai_color'] = 'pink';
            
                } 
                else if(req.body.cdai >= 22){
                    body['cdai_status'] = 'High Disease Activity';
                    body['cdai_color'] = 'red';
            
                } 
            }
            else {
                if(req.body.cdai <= 2.8){
                    body['cdai_status'] = 'المرض ساكن (غير نشط)';
                    body['cdai_color'] = 'green';
            
                    
                } 
                else if(req.body.cdai >= 2.8 && (+req.body.cdai) <9.9){
                    body['cdai_status'] = 'Low نشاط المرض';
                    body['cdai_color'] = 'yellow';
            
                } 
                else if(req.body.cdai >= 10 && (+req.body.cdai) <9.9){
                    body['cdai_status'] = 'Moderate نشاط المرض';
                    body['cdai_color'] = 'pink';
            
                } 
                else if(req.body.cdai >= 22){
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




router.post('/doctor-insert',(req,res)=>{
    
    let db = [
        
        
            {
             "category": "Denosumab 60mg",
             "subcategory": "Prolia"
            },
            {
             "category": "Denosumab 120mg",
             "subcategory": "Xgeva"
            },
            {
             "category": "Zoledronic Acid",
             "subcategory": "Aclasta "
            },
            {
             "category": "Zoledronic Acid",
             "subcategory": "Xolarex"
            },
            {
             "category": "Teriparatide ",
             "subcategory": "Forteo subcutaneous injection"
            },
            {
             "category": "Ibandronic Oral Tab",
             "subcategory": "Bonviva 150mg "
            },
            {
             "category": "Alendronate Sodium & Vitamin D3",
             "subcategory": "Fosavance70mg "
            },
            {
             "category": "Alendronate Sodium",
             "subcategory": "Alendomax"
            },
            {
             "category": "Vit D3 -Cholecalciferol",
             "subcategory": "Biodal"
            },
            {
             "category": "Vit D4 -Cholecalciferol",
             "subcategory": "Hi Dee"
            },
            {
             "category": "Vit D5 -Cholecalciferol",
             "subcategory": "Vitamin D Lynae"
            },
            {
             "category": "Cholecalciferol Drops",
             "subcategory": "Biodal 400 IU\/ drop"
            },
            {
             "category": "Cholecalciferol Drops",
             "subcategory": "Dcol 400 IU\/\/drop "
            },
            {
             "category": "Calcium",
             "subcategory": "Calcium"
            },
            {
             "category": "Calcium + Vit D3",
             "subcategory": "Osteocare"
            },
            {
             "category": "Calcium + Vit D4",
             "subcategory": "Caltrate-D"
            },
            {
             "category": "Alfacalcidol",
             "subcategory": "One-Alpha"
            },
            {
             "category": "Hydroxychloroquine 200mg   ",
             "subcategory": "Advaquenil"
            },
            {
             "category": "Hydroxychloroquine 201mg   ",
             "subcategory": "Plaquenil"
            },
            {
             "category": "Leflunomide 20mg",
             "subcategory": "Arava"
            },
            {
             "category": "Leflunomide 21mg",
             "subcategory": "Avara"
            },
            {
             "category": "Cyclosporine",
             "subcategory": "Cyclosporine"
            },
            {
             "category": "Cyclosporine",
             "subcategory": "Neoral"
            },
            {
             "category": "Cyclosporine",
             "subcategory": "Sandimmunee"
            },
            {
             "category": "Azathioprine",
             "subcategory": "Imuran"
            },
            {
             "category": "Dapsone ",
             "subcategory": "Dapsone"
            },
            {
             "category": "Mycophenolate",
             "subcategory": "CellCept"
            },
            {
             "category": "Mycophenolate",
             "subcategory": "MyOra"
            },
            {
             "category": "Tacrolimus ",
             "subcategory": "Prograf"
            },
            {
             "category": "Sulfasalazine",
             "subcategory": "Salazopyrin"
            },
            {
             "category": "Mesalazine",
             "subcategory": "Pentasa"
            },
            {
             "category": "Methotrexate Injection",
             "subcategory": "Methotrexate Injection"
            },
            {
             "category": "Folic Acid 5mg",
             "subcategory": "Folic Acid 5mg "
            },
            {
             "category": "Methotrexate S\/C Injection",
             "subcategory": "Ebetrexat Prefilled Syringe S\/C Injection"
            },
            {
             "category": "Methotrexate Oral",
             "subcategory": "Methotrexate 2.5mg"
            },
            {
             "category": "Etanercept",
             "subcategory": "Enbrel 50mg S\/C Injection"
            },
            {
             "category": "Adalimumab",
             "subcategory": "Humira 40mg S\/C Injection"
            },
            {
             "category": "Adalimumab Biosimilar",
             "subcategory": "Amgevita 40mg S\/C Injection"
            },
            {
             "category": "Infliximab",
             "subcategory": "Remicade IV Infusion"
            },
            {
             "category": "Infliximab Biosimilar",
             "subcategory": "Remsima IV Infusion"
            },
            {
             "category": "Rituximab",
             "subcategory": "MabThera  IV Infusion"
            },
            {
             "category": "Rituximab Biosimilar",
             "subcategory": "Truxima  IV Infusion"
            },
            {
             "category": "Tofacitinib 5mg ",
             "subcategory": "Xeljanz 5mg "
            },
            {
             "category": "Tofacitinib 10mg ",
             "subcategory": "Xeljanz 10mg"
            },
            {
             "category": "Secukinumab",
             "subcategory": "Cosentyx Autoinjector 150mg"
            },
            {
             "category": "Golimumab",
             "subcategory": "Simponi"
            },
            {
             "category": "Tocilizumab",
             "subcategory": "Actemra IV Infusion"
            },
            {
             "category": "Cevimeline",
             "subcategory": "Evoxac"
            },
            {
             "category": "Pilocarpine",
             "subcategory": "Salagen"
            },
            {
             "category": "Bosentan",
             "subcategory": "Tracleer"
            },
            {
             "category": "Pentoxifylline",
             "subcategory": "Trental"
            },
            {
             "category": "Ibuprofen",
             "subcategory": "Advil"
            },
            {
             "category": "Ibuprofen",
             "subcategory": "Brufen"
            },
            {
             "category": "Etoricoxib",
             "subcategory": "Arcoxia"
            },
            {
             "category": "Etoricoxib",
             "subcategory": "Orotex"
            },
            {
             "category": "Etoricoxib",
             "subcategory": "Atoxia"
            },
            {
             "category": "Diclofenac Potassium",
             "subcategory": "Cataflam"
            },
            {
             "category": "Diclofenac Potassium",
             "subcategory": "Rapidos"
            },
            {
             "category": "Diclofenac Potassium",
             "subcategory": "Voldik-K"
            },
            {
             "category": "Diclofenac Potassium",
             "subcategory": "JoFlam"
            },
            {
             "category": "Celecoxib",
             "subcategory": "Celebrex"
            },
            {
             "category": "Celecoxib",
             "subcategory": "Revox"
            },
            {
             "category": "Celecoxib",
             "subcategory": "Flamex"
            },
            {
             "category": "Meloxicam",
             "subcategory": "Mobic"
            },
            {
             "category": "Meloxicam",
             "subcategory": "Moven"
            },
            {
             "category": "Meloxicam",
             "subcategory": "Selektine"
            },
            {
             "category": "Naproxen",
             "subcategory": "Proxen"
            },
            {
             "category": "Naproxen\/Esomeprazole",
             "subcategory": "Kleprum"
            },
            {
             "category": "Naproxen Sodium 550mg",
             "subcategory": "Proxidol"
            },
            {
             "category": "Naproxen Sodium 551mg",
             "subcategory": "Nopain"
            },
            {
             "category": "Diclofenac-Deanol",
             "subcategory": "Tratul"
            },
            {
             "category": "Diclofenac Soudium",
             "subcategory": "Voltfast"
            },
            {
             "category": "Diclofenac Soudium",
             "subcategory": "Voltaren"
            },
            {
             "category": "Diclofenac Soudium",
             "subcategory": "Votrex"
            },
            {
             "category": "Diclofenac Soudium",
             "subcategory": "Rofenac"
            },
            {
             "category": "Diclofenac Soudium",
             "subcategory": "Divido"
            },
            {
             "category": "Diclofenac Soudium",
             "subcategory": "Olfen"
            },
            {
             "category": "Diclofenac Soudium",
             "subcategory": "Diclogesic"
            },
            {
             "category": "Diclofenac Soudium",
             "subcategory": "Inflaban"
            },
            {
             "category": "Ketoprofen",
             "subcategory": "Profenid"
            },
            {
             "category": "Nimesulide",
             "subcategory": "Nimelide"
            },
            {
             "category": "Nimesulide",
             "subcategory": "Ventor"
            },
            {
             "category": "Indomethacin",
             "subcategory": "Indogesic"
            },
            {
             "category": "Indomethacin",
             "subcategory": "Indomin"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "Tratul Gel"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "Voltaren-Emulgel"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "Biofreeze"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "Diclogesic Gel"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "Fastum Gel"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "EmuFlex"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "Radian Cream"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "JointFles"
            },
            {
             "category": "Topical Analgesic",
             "subcategory": "Deep Relief Gel"
            },
            {
             "category": "Acetylsalicylic Acid",
             "subcategory": "Aspirin 100mg"
            },
            {
             "category": "Clopidogrel",
             "subcategory": "Plavix"
            },
            {
             "category": "Clopidogrel",
             "subcategory": "Clopidocor"
            },
            {
             "category": "Candesartan",
             "subcategory": "Atacand"
            },
            {
             "category": "Candesartan",
             "subcategory": "Blopress"
            },
            {
             "category": "Candesartan\/Hydrochlorothiazide",
             "subcategory": "Atacand Plus"
            },
            {
             "category": "Candesartan\/Hydrochlorothiazide",
             "subcategory": "Blopress Plus"
            },
            {
             "category": "Valsartan",
             "subcategory": "Diovan"
            },
            {
             "category": "Valsartan\/Hydrochlorothiazide",
             "subcategory": "Co-Diovan"
            },
            {
             "category": "Amlodipine\/Valsartan",
             "subcategory": "Exforge"
            },
            {
             "category": "Amlodipine\/Valsartan\/Hydrochlorothiazide ",
             "subcategory": "Exforge HCT"
            },
            {
             "category": "Nebivolol",
             "subcategory": "Nebilet"
            },
            {
             "category": "Nebivolol\/Hydrochlorothiaze",
             "subcategory": "Nebilet Plus"
            },
            {
             "category": "Lercanidipine",
             "subcategory": "Lercadip"
            },
            {
             "category": "Propranolol",
             "subcategory": "Inderal"
            },
            {
             "category": "Propranolol",
             "subcategory": "Indicardin "
            },
            {
             "category": "Bisoprolol",
             "subcategory": "Concor"
            },
            {
             "category": "Bisoprolol",
             "subcategory": "B Cor"
            },
            {
             "category": "Atenolol",
             "subcategory": "Tenormin"
            },
            {
             "category": "Atenolol",
             "subcategory": "Hypoten"
            },
            {
             "category": "Diltiazem ",
             "subcategory": "Tildiem"
            },
            {
             "category": "Telmisartan",
             "subcategory": "Micardis"
            },
            {
             "category": "Telmisartan\/Hydrochlorothiazide",
             "subcategory": "Micardis Plus"
            },
            {
             "category": "Perindpril Argenine\/Amlodipine",
             "subcategory": "Coveram"
            },
            {
             "category": "Perindopril Arginine\/Indapamide",
             "subcategory": "biPreterax"
            },
            {
             "category": "Indapamide",
             "subcategory": "Natrilix"
            },
            {
             "category": "Nifedipine",
             "subcategory": "Adalat"
            },
            {
             "category": "Enalapril",
             "subcategory": "Angiotec"
            },
            {
             "category": "Enalapril",
             "subcategory": "Rnitic "
            },
            {
             "category": "Enalapril",
             "subcategory": "Lapril"
            },
            {
             "category": "Amlodipine",
             "subcategory": "Lowcasc"
            },
            {
             "category": "Amlodipine",
             "subcategory": "Norvasc"
            },
            {
             "category": "Amlodipine",
             "subcategory": "Lofral"
            },
            {
             "category": "Felodipine",
             "subcategory": "Plendil"
            },
            {
             "category": "Ramipril",
             "subcategory": "Tritace"
            },
            {
             "category": "Colchicine",
             "subcategory": "Colchicine"
            },
            {
             "category": "Allopurinol",
             "subcategory": "Zyloric"
            },
            {
             "category": "Allopurinol",
             "subcategory": "Purinol"
            },
            {
             "category": "Febuxostat",
             "subcategory": "Adenuric"
            },
            {
             "category": "Febuxostat",
             "subcategory": "Zoxta"
            },
            {
             "category": "Rosuvastatin",
             "subcategory": "Crestor"
            },
            {
             "category": "Rosuvastatin",
             "subcategory": "Excor"
            },
            {
             "category": "Rosuvastatin",
             "subcategory": "Roxardio"
            },
            {
             "category": "Pitavastatin",
             "subcategory": "Livazo"
            },
            {
             "category": "Simvastatin",
             "subcategory": "Zocor"
            },
            {
             "category": "Simvastatin",
             "subcategory": "Simvatin "
            },
            {
             "category": "Simvastatin",
             "subcategory": "Sivacor"
            },
            {
             "category": "Ezetimibe",
             "subcategory": "Xitrol"
            },
            {
             "category": "Ezetimibe",
             "subcategory": "Ezetrol"
            },
            {
             "category": "Ezetimibe\/Simvastatin",
             "subcategory": "Ezetimibe"
            },
            {
             "category": "Ezetimibe\/Simvastatin",
             "subcategory": "Inegy"
            },
            {
             "category": "Atorvastatin",
             "subcategory": "Lipitor"
            },
            {
             "category": "Atorvastatin",
             "subcategory": "Aditor"
            },
            {
             "category": "Atorvastatin",
             "subcategory": "Lipodar"
            },
            {
             "category": "Atorvastatin",
             "subcategory": "Atorvast"
            },
            {
             "category": "Atorvastatin",
             "subcategory": "Torva"
            },
            {
             "category": "Gemfibrozil",
             "subcategory": "Lopid"
            },
            {
             "category": "Fenofibrate",
             "subcategory": "Lipanthyl"
            },
            {
             "category": "Diosmin + Hesperidin",
             "subcategory": "Daflon"
            },
            {
             "category": "Serratiopeptase",
             "subcategory": "Serodase"
            },
            {
             "category": "Diethylamine Salicylate",
             "subcategory": "Reparil"
            },
            {
             "category": "Gabapentin",
             "subcategory": "Gabatrex "
            },
            {
             "category": "Gabapentin",
             "subcategory": "Neurontin "
            },
            {
             "category": "Gabapentin",
             "subcategory": "Regab"
            },
            {
             "category": "Esomeprazole",
             "subcategory": "Nexium"
            },
            {
             "category": "Esomeprazole",
             "subcategory": "Pumpinox "
            },
            {
             "category": "Rabeprazole",
             "subcategory": "Pariet"
            },
            {
             "category": "Omeprazole",
             "subcategory": "Gasec"
            },
            {
             "category": "Omeprazole",
             "subcategory": "Hyposec"
            },
            {
             "category": "Omeprazole",
             "subcategory": "Risek "
            },
            {
             "category": "Omeprazole",
             "subcategory": "Oprazole"
            },
            {
             "category": "Lansoprazole",
             "subcategory": "Takepron"
            },
            {
             "category": "Lansoprazole",
             "subcategory": "Lanzor \n"
            },
            {
             "category": "Lansoprazole",
             "subcategory": "Lazal"
            },
            {
             "category": "Lansoprazole",
             "subcategory": "Lansazol"
            },
            {
             "category": "Famotidine",
             "subcategory": "Famodar"
            },
            {
             "category": "Famotidine",
             "subcategory": "Famodine"
            },
            {
             "category": "Gaviscon",
             "subcategory": "Gaviscon"
            },
            {
             "category": "Domperidone",
             "subcategory": "Motilium"
            },
            {
             "category": "Metoclopramide",
             "subcategory": "Primperan"
            },
            {
             "category": "Itopride Hydochloride",
             "subcategory": "Ganaton"
            },
            {
             "category": "Ondansetron",
             "subcategory": "Zofran"
            },
            {
             "category": "Diacerein",
             "subcategory": "Art"
            },
            {
             "category": "Metformin",
             "subcategory": "Glucophage"
            },
            {
             "category": "Metformin",
             "subcategory": "metforal "
            },
            {
             "category": "Metformin",
             "subcategory": "Glymet "
            },
            {
             "category": "Gliclazide",
             "subcategory": "Diamicron"
            },
            {
             "category": "Glimepiride",
             "subcategory": "Amaryl"
            },
            {
             "category": "Tinazparin",
             "subcategory": "Innohep"
            },
            {
             "category": "Enoxaparin",
             "subcategory": "Clexane"
            },
            {
             "category": "Warfarin",
             "subcategory": "Orfarin"
            },
            {
             "category": "Rivaroxaban",
             "subcategory": "Xarelto"
            },
            {
             "category": "Dabigatran Etexilate",
             "subcategory": "Pradaxa"
            },
            {
             "category": "Apixaban",
             "subcategory": "Eliquis"
            },
            {
             "category": "Alpha Lipoic Acid",
             "subcategory": "Alpha Lipoic Acid "
            },
            {
             "category": "Alpha Lipoic Acid",
             "subcategory": "Lipox"
            },
            {
             "category": "Tocopherol Nicotinate",
             "subcategory": "Hijuven"
            },
            {
             "category": "Betahistine",
             "subcategory": "Betaserc"
            },
            {
             "category": "Betahistine",
             "subcategory": "verotec"
            },
            {
             "category": "Pregabalin",
             "subcategory": "Lyrica"
            },
            {
             "category": "Pregabalin",
             "subcategory": "Regab"
            },
            {
             "category": "Pregabalin",
             "subcategory": "Neurica "
            },
            {
             "category": "Tolperisone",
             "subcategory": "Mydocalm"
            },
            {
             "category": "Tolperisone",
             "subcategory": "Myomax"
            },
            {
             "category": "Eperison",
             "subcategory": "Myonal"
            },
            {
             "category": "Paracetamol\/Orphenadrine",
             "subcategory": "Myogesic"
            },
            {
             "category": "Tizanidin",
             "subcategory": "Sirdalaud"
            },
            {
             "category": "Tizanidin",
             "subcategory": "Relezin"
            },
            {
             "category": "Paracetamol\/Chlorzoxazone",
             "subcategory": "Relaxon"
            },
            {
             "category": "Vitamin B1 + B6 + B12",
             "subcategory": "Neurorubine Fort"
            },
            {
             "category": "Vitamin B1 + B6 + B13",
             "subcategory": "Neurobion "
            },
            {
             "category": "Paracetamol",
             "subcategory": "Panadol-Advanced"
            },
            {
             "category": "Paracetamol",
             "subcategory": "Panadol Joints"
            },
            {
             "category": "Paracetamol + Caffeine",
             "subcategory": "Panadol Extra"
            },
            {
             "category": "Paracetamol + Caffeine",
             "subcategory": "Excedrin"
            },
            {
             "category": "Paracetamol + Codeine",
             "subcategory": "Revacod"
            },
            {
             "category": "Tramadol",
             "subcategory": "Tramal"
            },
            {
             "category": "Prednisolone",
             "subcategory": "Prednisolone"
            },
            {
             "category": "Prednisolone",
             "subcategory": "Corotrope"
            },
            {
             "category": "Deflazacort",
             "subcategory": "Defal"
            },
            {
             "category": "Methylprednisolone",
             "subcategory": "Medrol"
            },
            {
             "category": "Thyroxine",
             "subcategory": "Eltroxine"
            },
            {
             "category": "Thyroxine",
             "subcategory": "Euthyrox"
            },
            {
             "category": "Testosterone",
             "subcategory": "Andriol"
            },
            {
             "category": "Methycobalamin",
             "subcategory": "Methycobal"
            },
            {
             "category": "Methycobalamin",
             "subcategory": "Cobal"
            },
            {
             "category": "Omega 3",
             "subcategory": "Omega 3"
            },
            {
             "category": "Sildenafil",
             "subcategory": "Viagara"
            },
            {
             "category": "Sildenafil",
             "subcategory": "Adenafil"
            },
            {
             "category": "Multivitamins",
             "subcategory": "Multivitamins"
            },
            {
             "category": "Iron",
             "subcategory": "Feroglobin"
            },
            {
             "category": "Iron",
             "subcategory": "Tardyferon"
            },
            {
             "category": "Iron",
             "subcategory": "Ferrotron"
            },
            {
             "category": "Iron",
             "subcategory": "Ironorm"
            },
            {
             "category": "Bisacodyl",
             "subcategory": "Dulcolax"
            },
            {
             "category": "Carbamazepine",
             "subcategory": "Tegretol"
            },
            {
             "category": "Dexamethazone",
             "subcategory": "Dexamed"
            },
            {
             "category": "Furosemide",
             "subcategory": "Lasix 40"
            },
            {
             "category": "Spironolactone",
             "subcategory": "Aldactone"
            },
            {
             "category": "Fexofenadine",
             "subcategory": "Telefast"
            },
            {
             "category": "Levocetirizine",
             "subcategory": "Xyzal"
            },
            {
             "category": "Desloratadine",
             "subcategory": "Aeriallerg"
            },
            {
             "category": "Desloratadine",
             "subcategory": "Aerius"
            },
            {
             "category": "Dimethindene",
             "subcategory": "Fenistil"
            },
            {
             "category": "Loratadine\/Pseudoephedrine Sulfate ",
             "subcategory": "Clarinase"
            },
            {
             "category": "Flupentixol\/Melitracen",
             "subcategory": "Deanxit"
            },
            {
             "category": "Amitrptyline ",
             "subcategory": "Tryptizol"
            },
            {
             "category": "Duloxetine",
             "subcategory": "Daltex"
            },
            {
             "category": "Duloxetine",
             "subcategory": "Cymbalta"
            },
            {
             "category": "Escitalopram",
             "subcategory": "Cipralex"
            },
            {
             "category": "Escitalopram",
             "subcategory": "Purlex"
            },
            {
             "category": "Sertraline",
             "subcategory": "Zoloft"
            },
            {
             "category": "Zolpidem",
             "subcategory": "Stilnox"
            },
            {
             "category": "Bromazepam",
             "subcategory": "Lexotanil"
            },
            {
             "category": "Alprazolam",
             "subcategory": "Xanax"
            },
            {
             "category": "Alprazolam",
             "subcategory": "Parzin"
            },
            {
             "category": "Diazepam",
             "subcategory": "Valium"
            },
            {
             "category": "Citalopram",
             "subcategory": "Cipram"
            },
            {
             "category": "Citalopram",
             "subcategory": "Lecital"
            },
            {
             "category": "Chlordiazepoxide\/Clidinium",
             "subcategory": "Librax"
            },
            {
             "category": "Mebeverine",
             "subcategory": "Duspatalin"
            },
            {
             "category": "Orphenadrine",
             "subcategory": "Spasmomen"
            },
            {
             "category": "Sulpiride",
             "subcategory": "Dogmatil"
            }
           
        ]

        // res.json(db.length)
        for(i=0;i<db.length;i++){
            pool.query(`insert into category set ?`,db[i],(err,result)=>{
                if(err) throw err;
                else {

                }
            })
        }
        res.json(db.length)
        
})


module.exports = router;
