
let data2;

function init(){
    
    document.getElementById('register').onclick = newUser;
    document.getElementById('login').onclick = login;
    
    
};
let xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        
       let data = this.responseText;
       data2 = data;
       
       check();
        
    }
};

rhttp = new XMLHttpRequest();
rhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        
       let data = this.responseText;
       data1 = data

       equality();
        
    }
};

function equality(){
    
    if(data1 === "okay"){

        alert("That username has already been taken. Please use another username.")
    }else{
        window.location.href = "http://localhost:3000/users/" + data1;
    }
}



function newUser(){

    
    rhttp.open("POST", "/register", true); 
   
    let name = document.getElementById('name1').value;
    let pass = document.getElementById('pass1').value;

    
    

   
     let newUser = {username :name, password : pass, privacy: false};
     

     
     
     
 
     rhttp.setRequestHeader("Content-Type", "application/json");
     
     rhttp.send(JSON.stringify(newUser)); 
    
    

    

}

function login(){
    xhttp.open("POST", "/check", true); 
    let name = document.getElementById('name').value;
    let pass = document.getElementById('pass').value;
    

    let newUser = {username :name, password: pass}

    xhttp.setRequestHeader("Content-Type", "application/json");
     
    xhttp.send(JSON.stringify(newUser)); 


}

function check(){

    if(data2 === "none"){
        alert("That username does not exist!");
    }if(data2 === "wrong"){
        alert("wrong password");
    }
    else{
        window.location.href = "http://localhost:3000/users/" + JSON.parse(data2);
    }

}