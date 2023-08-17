export default async function(){
       
    document.title = "Error!"

    let errorMessage = "Error, this page does not exist!"

    document.getElementById("app").innerHTML =`
        <h1>${errorMessage}</h1>
    `
}