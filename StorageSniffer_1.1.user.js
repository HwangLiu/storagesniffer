// ==UserScript==
// @name         Storage Sniffer
// @namespace    https://github.com/HwangLiu/storagesniffer
// @version      1.0
// @description  Mush item sharing tool
// @author       HwangLiu
// @match        http://mush.twinoid.com/
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// ==/UserScript==



//DETECTING WHETHER USER HAS INSTALLED CTRL+W
var ctrl_w_bar = document.getElementsByClassName("usLeftbar");
var ctrl_w_bar_width;
var ctrl_w;
if (ctrl_w_bar.length < 1) {
    ctrl_w = false;
}
else {
    ctrl_w = true;
    ctrl_w_bar_width = ctrl_w_bar[0].offsetWidth;
}

//DETECTING WHETHER EXPLORATION IS TAKING PLACE
/* actually not implemented yet, will be in verion 1.1, currently exploration bar will overlay UI while expo is taking place
var hidden_ui_container = document.getElementById("mush_content");
var expo_bar_class = hidden_ui_container.getElementsByClassName("exploring");
var exploration;
console.log(expo_bar_class.length);
if (expo_bar_class.length < 1) {
    exploration = false;
}
else {
    exploration = true;
}
console.log(exploration);
if (exploration == true) {
    expo_bar_class[0].style.float = "left";
    expo_bar_class[0].style.position = "absolute";
    if (ctrl_w == false) {
        expo_bar_class[0].style.marginTop = "-24px";
    }
    if (ctrl_w == true) {
        expo_bar_class[0].style.marginTop = "-41px";
        expo_bar_class[0].style.marginRight = "-24px";
    }
}
*/

//CREATING DIV TO STORE ALL UI
var st_sn_container = document.createElement("div");
var content_container = document.getElementById("content");
var kmenu_arr = content_container.getElementsByClassName("kmenu");
var main_container = document.getElementById("maincontainer");
content_container.insertBefore(st_sn_container, main_container);

var mush_page_width = document.body.clientWidth;
var container_width = main_container.offsetWidth;
var style_left = (mush_page_width - container_width)/2;
var style_top = 175;
var style_top_ctrl_w = 49;

st_sn_container.style.width = container_width + "px";
st_sn_container.style.position = "absolute";
if (ctrl_w == false) {
    st_sn_container.style.top = style_top + "px";
    st_sn_container.style.left = style_left + "px";
}
else if (ctrl_w == true) {
    st_sn_container.style.top = style_top_ctrl_w + "px";
    kmenu_arr[0].style.height = "67px";
    st_sn_container.style.left = (content_container.offsetWidth - container_width)/2 + "px";
}

var outer_table = document.createElement("table");
var info_bar_row = document.createElement("tr");
var storage_sniffer_row = document.createElement("tr");
st_sn_container.appendChild(outer_table);
outer_table.appendChild(info_bar_row);
outer_table.appendChild(storage_sniffer_row);
outer_table.style.float = "right";
info_bar_row.style.float = "right";
info_bar_row.style.height = "25px";

var ui_table = document.createElement("table");
var ui_table_row = document.createElement("tr");
ui_table.style.float = "right";

var ui_table_data = [];
var td = 0;
while (td<8) {
    ui_table_data[td] = document.createElement("td");
    ui_table_row.appendChild(ui_table_data[td]);
    td++;
}

ui_table.appendChild(ui_table_row);
storage_sniffer_row.appendChild(ui_table);

//GETTING SHIP ID FROM LOCAL STORAGE
var ls_ship_id = localStorage.getItem("ls_ship_id");

//CALCULATING THE ABSOLUTE CURRENT CYCLE (todo: make this block shorter with regex)
var current_day_cycle = document.querySelector("#localChannel > div:nth-child(1) > div.day_cycle > div")
var current_day_cycle_text = current_day_cycle.innerText;
var current_day_cycle_text_upped = current_day_cycle_text.toUpperCase();
var dc_0 = current_day_cycle_text_upped.slice(4);
var dc_1 = dc_0.indexOf(" CYCLE");
var cycle_string = dc_0.slice(dc_1 + 7);
var day_string = dc_0.slice(0, dc_1);
var day = parseInt(day_string);
var cycle = parseInt(cycle_string);
var day_and_cycle = "Day " + day + " Cycle " + cycle;
var cycle_absolute = ((day - 1) *8) + cycle;

//CLEAR LOCAL STORAGE DATA BUTTON (for debugging purposes)
/*
var delete_local_storage_button = document.createElement("button");
ui_table_data[7].appendChild(delete_local_storage_button);
delete_local_storage_button.innerText = "Clear LS";
delete_local_storage_button.className = "butbg";
delete_local_storage_button.addEventListener("click", clearLocalStorage);
*/

function clearLocalStorage () {
    localStorage.removeItem("ls_ship_id");
    ship_id_input.value = "";
}

//CREATING A BUTTON TO SEND POST REQUEST
var POST_button = document.createElement("button");
ui_table_data[6].appendChild(POST_button);
POST_button.innerText = "Share";
POST_button.className = "butbg";
POST_button.addEventListener("click", sendShipDataAsXMLHttp);

function sendShipDataAsXMLHttp() {
    ls_ship_id = localStorage.getItem("ls_ship_id");
    if (ls_ship_id !== null) {
        var room_name = document.getElementById("input").getAttribute("d_name");//name of the current room
        var item_list_ul_id = document.getElementById("room");//list element contaning all items in the room
        var item_list_in_the_room = item_list_ul_id.getElementsByClassName(" item  cdSerialTarget cdTipMe");//array of all item elements in the room

        var items = [];
        var i = 0;
        while (i < item_list_in_the_room.length) {
            var qty_element = item_list_in_the_room[i].getElementsByClassName("qty");
            var qty = "";
            if (qty_element.length > 0) {
                var qty_full = qty_element[0].innerText;
                var qty_extracted = qty_full.match(/\d+/);
                qty = " (x" + qty_extracted + ")";
            }
            var name_attr = item_list_in_the_room[i].getAttribute("data-name");
            if (name_attr.indexOf("hidden.png") != -1 || name_attr.indexOf("iTrak") != -1 || name_attr.indexOf("Walkie") != -1 || name_attr.indexOf("Tracker") != -1){
            }
            else if (name_attr.indexOf("<img") != -1) {
                items[i] = name_attr.slice(0, name_attr.indexOf("<img") - 1) + qty;
            }
            else {
                items[i] = item_list_in_the_room[i].getAttribute("data-name").trim() + qty;
            }
            i++;
        }
        items = items.filter(Boolean);
        if (items.length == 0) {
            items[0] = "--EMPTY--";
        }
        items.unshift(day_and_cycle);
        var items_string = items.join(", ");//THIS IS A COMPLETE LIST OF ITEMS FOR CURRENT ROOM + DAY AND CYCLE ATTACHED AS THE FIRST ELEMENT
        var object_for_sending = {ship_id: ls_ship_id, room_id: room_name, storage_data: items_string};
        //console.log(object_for_sending);
        var object_for_sending_JSONIFIED = JSON.stringify(object_for_sending);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "https://storagesniffer.000webhostapp.com/system/config.php");
        xhr.send(object_for_sending_JSONIFIED);
        dataShared();
        removeNotice(1500);
    }
    else {
        emptyIdError();
        removeNotice(6000);
    }
}

function emptyIdError () {
    info_bar_row.innerText = "ERROR. Ship ID is empty. Create new ID or add an existing one!"
    info_bar_row.style.color = "red";
}

function dataShared () {
    info_bar_row.innerText = "Shared!"
    info_bar_row.style.color = "yellow";
}

function removeNotice (time) {
    setTimeout( function removeTextFromInfoBar () {
        info_bar_row.innerText = "";
        info_bar_row.style.color = "white";
    }, time);
}

//CREATING STORAGE BUTTON
var storage_button = document.createElement("button");
ui_table_data[5].appendChild(storage_button);
var st_btn_icon = document.createElement('img');
st_btn_icon.src = "/img/icons/ui/stock.png";
storage_button.appendChild(st_btn_icon);
storage_button.className = "butbg";

//applying styles for storage container
var storage_div = document.createElement("div");
storage_div.id = "storage_container";
storage_div.style.width = container_width + "px";
storage_div.style.height = "auto";
storage_div.style.top = style_top + st_sn_container.offsetHeight + 2 + "px";
storage_div.style.left = style_left + "px";
storage_div.style.background = "#0f0f43";
storage_div.style.position = "absolute";
storage_div.style.border = '1px solid double black';
storage_div.style.zIndex = "1501";
storage_div.style.boxShadow = "inset 0px 0px 4px 4px rgba(100,200,255,0.5)";
if (ctrl_w == true) {
    storage_div.style.top = (style_top_ctrl_w + st_sn_container.offsetHeight) + "px";
    storage_div.style.left = (content_container.offsetWidth - container_width)/2 + "px";
}

//creating global header table for storage container and applying styles
var header_table = document.createElement("table");
header_table.style.margin = "10px 5px 2px 5px";
header_table.style.fontSize = "14px";
header_table.width = "100%";
var header_table_row = document.createElement("tr");
var header_table_ship_id_field = document.createElement("td");
var header_table_time_field = document.createElement("td");
var header_table_input_field = document.createElement("td");
header_table.appendChild(header_table_row);
header_table_row.appendChild(header_table_ship_id_field);
header_table_row.appendChild(header_table_time_field);
header_table_row.appendChild(header_table_input_field);

header_table_row.style.margin = "5px";
header_table_ship_id_field.style.paddingLeft = "5px";
header_table_time_field.padding = "10px";
header_table_input_field.style.float = "right";
header_table_input_field.style.marginRight = "14px";
header_table_input_field.style.marginBottom = "2px";

//creating storage data table and applying styles
var storage_table = document.createElement("table");
storage_table.style.margin = "auto 10px 8px 10px";

GM_addStyle (" .row_even { \
             font-size: 16px; \
             font-weight: bold; \
             background-color: darkslategray; \
}");

GM_addStyle (" .data_field { \
             padding: 3px; \
             vertical-align: top; \
             width: 346px\
}");

var storage_table_row = [];
var trs = 0;
var header_row_class_selector = 1;
while (trs < 19) {
    var tds = 0;
    var storage_table_data = [];
    storage_table_row[trs] = document.createElement("tr");
    storage_table.appendChild(storage_table_row[trs]);
    if (header_row_class_selector == 1) {
        storage_table_row[trs].className = "row_odd";
    }
    else {
        storage_table_row[trs].className = "row_even";
    }
    header_row_class_selector = header_row_class_selector * -1;

    while (tds < 3) {
        storage_table_data[tds] = document.createElement("td");
        storage_table_row[trs].appendChild(storage_table_data[tds]);
        storage_table_data[tds].style.border = "1px solid white";
        storage_table_data[tds].id = "td" + (trs * 3 + (tds + 1));
        storage_table_data[tds].className = "data_field";

        switch (trs * 3 + (tds + 1)) {
            case 4:
            case 7:
                storage_table_data[tds].className += " fs";
                break;
            case 5:
            case 8:
                storage_table_data[tds].className += " ad";
                break;
            case 6:
            case 9:
                storage_table_data[tds].className += " fc";
                break;
            case 10:
            case 13:
                storage_table_data[tds].className += " cas";
                break;
            case 11:
            case 14:
                storage_table_data[tds].className += " bd";
                break;
            case 12:
            case 15:
                storage_table_data[tds].className += " cc";
                break;
            case 16:
            case 19:
                storage_table_data[tds].className += " cbs";
                break;
            case 17:
            case 20:
                storage_table_data[tds].className += " bridge";
                break;
            case 18:
            case 21:
                storage_table_data[tds].className += " rc";
                break;
            case 22:
            case 25:
                storage_table_data[tds].className += " ras";
                break;
            case 23:
            case 26:
                storage_table_data[tds].className += " hg";
                break;
            case 24:
            case 27:
                storage_table_data[tds].className += " fat";
                break;
            case 28:
            case 31:
                storage_table_data[tds].className += " rbs";
                break;
            case 29:
            case 32:
                storage_table_data[tds].className += " lab";
                break;
            case 30:
            case 33:
                storage_table_data[tds].className += " fbt";
                break;
            case 34:
            case 37:
                storage_table_data[tds].className += " ab";
                break;
            case 35:
            case 38:
                storage_table_data[tds].className += " medlab";
                break;
            case 36:
            case 39:
                storage_table_data[tds].className += " cat";
                break;
            case 40:
            case 43:
                storage_table_data[tds].className += " ab2";
                break;
            case 41:
            case 44:
                storage_table_data[tds].className += " ref";
                break;
            case 42:
            case 45:
                storage_table_data[tds].className += " cbt";
                break;
            case 46:
            case 49:
                storage_table_data[tds].className += " bb";
                break;
            case 47:
            case 50:
                storage_table_data[tds].className += " nexus";
                break;
            case 48:
            case 51:
                storage_table_data[tds].className += " rat";
                break;
            case 52:
            case 55:
                storage_table_data[tds].className += " ib";
                break;
            case 53:
            case 56:
                storage_table_data[tds].className += " er";
                break;
            case 54:
            case 57:
                storage_table_data[tds].className += " rbt";
                break;
            default:
                storage_table_data[tds].className += " no_room_class";
}
        tds++;
       }
    trs++;
}

//todo: fix excess table cells properly
function fixExcessCells () {
    var dumb_fix = document.getElementsByClassName("no_room_class");
    dumb_fix[0].style.display = "none";
    dumb_fix[1].style.display = "none";
    dumb_fix[2].style.display = "none";
}

storage_div.appendChild(header_table);
storage_div.appendChild(storage_table);

var storage_div_switch = 0;

storage_button.addEventListener("click", openStorage);

var filter_table_input = document.createElement("input");//creating input element to filter items on storage container
function filterItems() {
var filter, room_classes, txtHeaderValue, txtDataValue;
	filter = filter_table_input.value.toUpperCase();
	room_classes = ["fs", "ad", "fc", "cas", "bd", "cc", "cbs", "bridge", "rc", "ras", "hg", "fat", "rbs", "lab", "fbt", "ab", "medlab", "cat", "ab2", "ref", "cbt", "bb", "nexus", "rat", "ib", "er", "rbt"];

	for (var i = 0; i < room_classes.length; i++) {
		var selected_room = storage_table.getElementsByClassName(room_classes[i]);
		txtHeaderValue = selected_room[0].innerText;
		txtDataValue = selected_room[1].innerText;
		if (txtHeaderValue.toUpperCase().indexOf(filter) > -1 || txtDataValue.toUpperCase().indexOf(filter) > -1) {
			selected_room[0].style.display = "";
			selected_room[1].style.display = "";
		}

		else {
			selected_room[0].style.display = "none";
			selected_room[1].style.display = "none";
		}
	}
}

function makeAllVisible () {
    var table_cells = document.getElementsByClassName("data_field");
    var x = 0;
    while (x < table_cells.length) {
        table_cells[x].style.display = "";
        x++;
    }
}

function wrongIdError () {
    info_bar_row.innerText = "ERROR. No such ID in the database. If just created - click Share to activate this ID."
    info_bar_row.style.color = "red";
}

function openStorage() {
    if (storage_div_switch == 0) {
        content_container.insertBefore(storage_div, st_sn_container);
        fixExcessCells();//todo: fix this bad fix
        header_table_ship_id_field.innerText = "Your Ship ID is:";
        var room = document.getElementById("input").getAttribute("d_name");
        header_table_time_field.innerText = "Room: " + room + " / Time: " + day_and_cycle;
        ls_ship_id = localStorage.getItem("ls_ship_id");
        if (ls_ship_id !== null) {
            var object_for_sending = {ship_id: ls_ship_id};
            //console.log(object_for_sending);
            var object_for_sending_JSONIFIED = JSON.stringify(object_for_sending);
            var xhr = new XMLHttpRequest();
            xhr.open('POST','https://storagesniffer.000webhostapp.com/system/config.php');
            xhr.send(object_for_sending_JSONIFIED);
            var recieved_info_parsed ={};
            xhr.onload = function () {
                var recieved_info = xhr.response;
                if (xhr.response.length == 8) {
                    header_table_ship_id_field.innerText = "Your Ship ID is: " + localStorage.getItem("ls_ship_id") + " (inactive)";
                    wrongIdError ();
                    removeNotice (15000);
                }
                else {
                    recieved_info_parsed = JSON.parse(recieved_info);
                    //console.log(recieved_info_parsed);
                    header_table_ship_id_field.innerText = header_table_ship_id_field.innerText + " " + recieved_info_parsed["Ship ID"];

                    var fs_data = document.getElementById("td7");
                    fs_data.innerText = recieved_info_parsed["Front Storage"];

                    var ad_data = document.getElementById("td8");
                    ad_data.innerText = recieved_info_parsed["Alpha Dorm"];

                    var fc_data = document.getElementById("td9");
                    fc_data.innerText = recieved_info_parsed["Front Corridor"];

                    var cas_data = document.getElementById("td13");
                    cas_data.innerText = recieved_info_parsed["Centre Alpha Storage"];

                    var bd_data = document.getElementById("td14");
                    bd_data.innerText = recieved_info_parsed["Bravo Dorm"];

                    var cc_data = document.getElementById("td15");
                    cc_data.innerText = recieved_info_parsed["Central Corridor"];

                    var cbs_data = document.getElementById("td19");
                    cbs_data.innerText = recieved_info_parsed["Centre Bravo Storage"];

                    var bridge_data = document.getElementById("td20");
                    bridge_data.innerText = recieved_info_parsed["Bridge"];

                    var rc_data = document.getElementById("td21");
                    rc_data.innerText = recieved_info_parsed["Rear Corridor"];

                    var ras_data = document.getElementById("td25");
                    ras_data.innerText = recieved_info_parsed["Rear Alpha Storage"];

                    var hg_data = document.getElementById("td26");
                    hg_data.innerText = recieved_info_parsed["Hydroponic Garden"];

                    var fat_data = document.getElementById("td27");
                    fat_data.innerText = recieved_info_parsed["Front Alpha Turret"];

                    var rbs_data = document.getElementById("td31");
                    rbs_data.innerText = recieved_info_parsed["Rear Bravo Storage"];

                    var lab_data = document.getElementById("td32");
                    lab_data.innerText = recieved_info_parsed["Laboratory"];

                    var fbt_data = document.getElementById("td33");
                    fbt_data.innerText = recieved_info_parsed["Front Bravo Turret"];

                    var ab_data = document.getElementById("td37");
                    ab_data.innerText = recieved_info_parsed["Alpha Bay"];

                    var medlab_data = document.getElementById("td38");
                    medlab_data.innerText = recieved_info_parsed["Medlab"];

                    var cat_data = document.getElementById("td39");
                    cat_data.innerText = recieved_info_parsed["Centre Alpha Turret"];

                    var ab2_data = document.getElementById("td43");
                    ab2_data.innerText = recieved_info_parsed["Alpha Bay 2"];

                    var ref_data = document.getElementById("td44");
                    ref_data.innerText = recieved_info_parsed["Refectory"];

                    var cbt_data = document.getElementById("td45");
                    cbt_data.innerText = recieved_info_parsed["Centre Bravo Turret"];

                    var bb_data = document.getElementById("td49");
                    bb_data.innerText = recieved_info_parsed["Bravo Bay"];

                    var nexus_data = document.getElementById("td50");
                    nexus_data.innerText = recieved_info_parsed["Nexus"];

                    var rat_data = document.getElementById("td51");
                    rat_data.innerText = recieved_info_parsed["Rear Alpha Turret"];

                    var ib_data = document.getElementById("td55");
                    ib_data.innerText = recieved_info_parsed["Icarus Bay"];

                    var er_data = document.getElementById("td56");
                    er_data.innerText = recieved_info_parsed["Engine Room"];

                    var rbt_data = document.getElementById("td57");
                    rbt_data.innerText = recieved_info_parsed["Rear Bravo Turret"];

                    filter_table_input.type = "text";
                    filter_table_input.setAttribute('maxlength', 20);
                    filter_table_input.value = "";
                    filter_table_input.placeholder = "Type item name...";
                    filter_table_input.style.color = "black";
                    filter_table_input.stylewidth = "100%";
                    filter_table_input.stylewidth = "100%";
                    filter_table_input.onkeyup = filterItems;

                    header_table_input_field.appendChild(filter_table_input);
                }
            }
        }
        else {
            header_table_ship_id_field.innerText = header_table_ship_id_field.innerText + " empty. Create new ID or add an existing one.";
            emptyIdError();
            removeNotice(6000);
        }

        var fs = document.getElementById("td4");
        fs.innerText = "Front Storage";

        var ad = document.getElementById("td5");
        ad.innerText = "Alpha Dorm";

        var fc = document.getElementById("td6");
        fc.innerText = "Front Corridor";

        var cas = document.getElementById("td10");
        cas.innerText = "Centre Alpha Storage";

        var bd = document.getElementById("td11");
        bd.innerText = "Bravo Dorm";

        var cc = document.getElementById("td12");
        cc.innerText = "Central Corridor";

        var cbs = document.getElementById("td16");
        cbs.innerText = "Centre Bravo Storage";

        var bridge = document.getElementById("td17");
        bridge.innerText = "Bridge";

        var rc = document.getElementById("td18");
        rc.innerText = "Rear Corridor";

        var ras = document.getElementById("td22");
        ras.innerText = "Rear Alpha Storage";

        var hg = document.getElementById("td23");
        hg.innerText = "Hydroponic Garden";

        var fat = document.getElementById("td24");
        fat.innerText = "Front Alpha Turret";

        var rbs = document.getElementById("td28");
        rbs.innerText = "Rear Bravo Storage";

        var lab = document.getElementById("td29");
        lab.innerText = "Laboratory";

        var fbt = document.getElementById("td30");
        fbt.innerText = "Front Bravo Turret";

        var ab = document.getElementById("td34");
        ab.innerText = "Alpha Bay";

        var medlab = document.getElementById("td35");
        medlab.innerText = "Medlab";

        var cat = document.getElementById("td36");
        cat.innerText = "Centre Alpha Turret";

        var ab2 = document.getElementById("td40");
        ab2.innerText = "Alpha Bay 2";

        var ref = document.getElementById("td41");
        ref.innerText = "Refectory";

        var cbt = document.getElementById("td42");
        cbt.innerText = "Centre Bravo Turret";

        var bb = document.getElementById("td46");
        bb.innerText = "Bravo Bay";

        var nexus = document.getElementById("td47");
        nexus.innerText = "Nexus";

        var rat = document.getElementById("td48");
        rat.innerText = "Rear Alpha Turret";

        var ib = document.getElementById("td52");
        ib.innerText = "Icarus Bay";

        var er = document.getElementById("td53");
        er.innerText = "Engine Room";

        var rbt = document.getElementById("td54");
        rbt.innerText = "Rear Bravo Turret";

        storage_div_switch = 1;
    }
    else {
        makeAllVisible();
        filter_table_input.remove();
        storage_div.remove();
        storage_div_switch = 0;
    }
}

//CREATING UI EXPANSION BUTTON
var exp_button = document.createElement("button");
ui_table_data[4].appendChild(exp_button);
exp_button.innerText = "<<";
exp_button.className = "butbg";

var exp_button_switch = 0;
exp_button.addEventListener("click", expandMenu);

function expandMenu() {
    if (exp_button_switch == 0) {
        ship_id_input.style.visibility = "visible";
        add_button.style.visibility = "visible";
        new_button.style.visibility = "visible";
        help_button.style.visibility = "visible";
        exp_button.innerText = ">>";
        exp_button_switch = 1;
    }
    else {
        ship_id_input.style.visibility = "hidden";
        add_button.style.visibility = "hidden";
        new_button.style.visibility = "hidden";
        help_button.style.visibility = "hidden";
        exp_button.innerText = "<<";
        exp_button_switch = 0;
    }
}

//CREATING SHIP_ID INPUT FIELD
var ship_id_input = document.createElement("input");
ship_id_input.type = "text";
ship_id_input.setAttribute('maxlength', 9);
ship_id_input.value = localStorage.getItem("ls_ship_id");
ship_id_input.placeholder = "Your ship ID";
ui_table_data[3].appendChild(ship_id_input);
ship_id_input.style.color = "black";
ship_id_input.style.visibility = "hidden";

//CREATING ADD BUTTON
var add_button = document.createElement("button");
ui_table_data[2].appendChild(add_button);
add_button.innerText = "Add";
add_button.className = "butbg";
add_button.addEventListener("click", addShipID);
add_button.style.visibility = "hidden";

var existing_ship_id;
function addShipID() {
    if (ship_id_input.value > 0) {
        existing_ship_id = ship_id_input.value;
        localStorage.setItem("ls_ship_id", existing_ship_id);
        idAdded();
        removeNotice (2000);
    }
    else {
        emptyAddError();
        removeNotice (6000);
    }
}

function emptyAddError() {
    info_bar_row.innerText = "Invalid Ship ID. It can't be empty and must contain only numbers!";
    info_bar_row.style.color = "red";
}

function idAdded () {
    info_bar_row.innerText = "Ship ID successfully added!";
    info_bar_row.style.color = "yellow";
}

//CREATING NEW BUTTON
var new_button = document.createElement("button");
ui_table_data[1].appendChild(new_button);
new_button.innerText = "New";
new_button.className = "butbg";
new_button.style.visibility = "hidden";

var new_ship_id = "";
new_button.addEventListener("click", createNewShipID);

function createNewShipID() {
    new_ship_id = Math.floor(Math.random() * 999999999);
    ship_id_input.value = new_ship_id;
    localStorage.setItem("ls_ship_id", new_ship_id);
    idCreated();
    removeNotice (2000);
}

function idCreated() {
    info_bar_row.innerText = "New Ship ID successfully created!";
    info_bar_row.style.color = "yellow";
}

//CREATING HELP BUTTON
var help_button = document.createElement("button");
ui_table_data[0].appendChild(help_button);
help_button.innerText = "?";
help_button.className = "butbg";
help_button.style.visibility = "hidden";

var help_container = document.createElement("div");
var help_switch = 0;
help_button.addEventListener("click", openHelp);

function openHelp() {
    if (help_switch == 0) {
        help_button.appendChild(help_container);
        help_container.innerHTML = "New - create new Ship ID and new Item List.<br> \
Use when you start a new ship.<br> \
Share Ship ID with other players!<br> \
---------------------------------------------------------------------------------<br> \
Add - add existing Ship ID to gain access to Item List!<br> \
---------------------------------------------------------------------------------<br> \
Works alone or with CTRL+W installed.<br> \
To avoid conflicts, CTRL+W should be installed first.<br> \
Scripts are executed in the order of their installation.<br> \
To change the order: Tampermonkey -> Dashboard -><br> \
-> Script -> Settings (near Editor) -> Position<br> \
---------------------------------------------------------------------------------<br> \
Report bugs: storagesniffer@dispostable.com<br> \
Storage Sniffer version 1.0";
        help_container.style.position = "absolute";
        help_container.style.background = "#0f0f43";
        help_container.style.border = '1px solid double black';
        help_container.style.zIndex = "1502";
        help_container.style.padding = "10px";
        help_container.style.boxShadow = "inset 0px 0px 4px 4px rgba(100,200,255,0.5)";
        help_container.style.fontWeight = "normal";
        help_container.style.textAlign = "left";
        help_container.style.maxWidth = "358px";
        help_switch = 1;
    }
    else {
        help_container.remove();
        help_switch = 0;
    }
}