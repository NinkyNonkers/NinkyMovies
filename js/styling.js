const dropdownMenuA = document.getElementById("ddmenuA");
const dropdownMenuB = document.getElementById("ddmenuB");

//faster alternative to using jquery lol, I know its horrible but really its readable and considering the performance benefit theres no need to heavily design this
let dropDownToggledA = false;
let dropDownToggledB = false;

function dropDownAClicked() {
    dropDownToggledA = !dropDownToggledA;
    if (dropDownToggledA) {
        dropdownMenuA.style.display = 'block';
        return;
    }
    dropdownMenuA.style.display = 'none'
}

function dropDownBClicked() {
    dropDownToggledB = !dropDownToggledB;
    if (dropDownToggledB) {
        dropdownMenuB.style.display = 'block';
        return;
    }
    dropdownMenuB.style.display = 'none'
}

function dropdownButtonAClicked(roomnum, index, callback) {
    dropDownAClicked();
    callback(roomnum, index);
}

function dropdownButtonBClicked(index, callback) {
    dropDownBClicked();
    callback(index);
}