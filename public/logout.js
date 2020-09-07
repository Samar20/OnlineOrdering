function init(){
    document.getElementById('logout').onclick = logout;

    document.getElementById('save').onclick = save;
    
    
    
};
let rhttp = new XMLHttpRequest();
rhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        
       let data = this.responseText;
  
       window.location.href = "http://localhost:3000/";
       
       
        
    }
};
let xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        
       let data = JSON.parse(this.responseText);

  
       window.location.href = "http://localhost:3000/"+ data, true;
       
       
        
    }
};

function logout(){

    rhttp.open("POST", "/logout", true); 

    rhttp.send("logout");
}

function save(){
    


    let on = document.getElementById('on').checked;
    let off = document.getElementById('off').checked;

    if(on == true){
        xhttp.open("POST", "/save?privacy=on", true);
        xhttp.send()
    }else if(off==true){
        xhttp.open("POST", "/save?privacy=off", true);
        xhttp.send()
    }


}