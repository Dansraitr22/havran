
const searchdata=document.getElementById ("str1") as HTMLInputElement
const searched=document.getElementById("button1") as HTMLInputElement
const  printtex=document.getElementById("enteredtext") as HTMLInputElement
function printtext():void{
    const string1=searchdata.value;
    printtex.textContent= string1;
}
searched.addEventListener('click',printtext)
function searching() 
    {if (searchdata.textContent==="ahoj")
    {
    console.log ("ahoj")
    } 
      else{console.log("peknej moula")}}

