'use strict';



let difficulties = document.body.querySelectorAll('button');

for (let i = 0; i < difficulties.length; i++) {
    difficulties[i].onclick = function() {
        // redirects to 'game.html' with the value of the clicked button passed in the URL as a query parameter
        location.href = 'game.html?value=' + i;
    };
}
