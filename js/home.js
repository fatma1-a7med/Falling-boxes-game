window.onload=function(){ 
    document.querySelector('.playButton').addEventListener('click', () => {
        // Using SweetAlert2 to get user name
        Swal.fire({
            title: 'Enter Your Name',
            input: 'text',
            showCancelButton: true,
            confirmButtonText: 'Play',
            cancelButtonText: 'Cancel',
            preConfirm: (name) => {
                if (!name){
                    Swal.showValidationMessage('Name is required');
                }
                else{
                    name=new String(name);
                    let fullNameSplittes= name.split(" ");
                    let result="";
                    for(let i=0;i<fullNameSplittes.length;i++){
                        result += fullNameSplittes[i][0].toUpperCase() + fullNameSplittes[i].substr(1)+" ";
                    }
                    return result;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const userName = result.value;
                // Save user name to localStorage
                localStorage.setItem('userName', userName);
                // Redirect to Game Page
                window.location.href = 'Game.html';
            }
        });
    });
};