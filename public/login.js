function init(){
    document.getElementById('login').onclick = login;
    
    
    
};
let data1;

let rhttp = new XMLHttpRequest();
rhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        
       let data = this.responseText;
       data1 = data;
       
       check();
        
    }
};


function login(){
    rhttp.open("POST", "/check", true); 
    let name = document.getElementById('name').value;
    let pass = document.getElementById('pass').value;
    

    let newUser = {username :name, password: pass}

    rhttp.setRequestHeader("Content-Type", "application/json");
     
    rhttp.send(JSON.stringify(newUser)); 


}

function check(){

    if(data1 === "none"){
        alert("That username does not exist!");
    }if(data1 === "wrong"){
        alert("wrong password");
    }
    else{
        window.location.href = "http://localhost:3000/users/" + JSON.parse(data1);
    }

}