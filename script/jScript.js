'use strict';

(function(){
    var popUp,
        thisDate = new Date(),
        thisTime,
        listLength = 0;
    window.myListDB = {};
    
    var toDomyList = {
        dom: {
            /* new Assignment */
            newAssignmentName: $('#newAssignmentName'),
            newAssignmentDate: $('#newAssignmentDate'),
            newAssignmentText: $('#newAssignmentText'),
            /* edit Assignment */
            editAssignmentName: $('#editAssignmentName'),
            editAssignmentText: $('#editAssignmentText'),
            editAssignmentDate: $('#editAssignmentDate'),
            background: $('#background')
        },
    	init: function () {
            if( localStorage.getItem('index0') !== null ) { 
                console.log("yes localStorage");
                toDomyList.localStorageGetList();                
             }
            else { 
                console.log("no localStorage");
                toDomyList.ajaxGetList();
            }
            newListitem();
            editListitem();
            deleteAssignment();
            setOrderBy();

            backgroundCloseOnClick();

            $('#saveMyList').on('click', localStorageDB);
    	},
        localStorageGetList: function () {
            // local Storage -> DOM Object
            myListDB = '';
            for (var i = 0; i < localStorage.length; i++) {
                if (localStorage.getItem('index' + i) !== "undefined") {
                    var space = 1 === (localStorage.length -1) ? '' : ',';
                    myListDB += localStorage.getItem('index' + i) + space;
                };
            };
            myListDB = eval('{ [' + myListDB+ '] }');

            toDomyList.allDOMlist();
        },
    	ajaxGetList: function () {
    		$.ajax({
    			type: "GET",
    			url: "script/data/data.json",
    			dataType: "json"
    		}).done(function (data) {
                myListDB = data.toDoList;

    			toDomyList.allDOMlist();
    		}).fail(function () {
                myListDB = [{
                        "id" : 0,
                        "done" : "0/1",
                        "assignment" : "text",
                        "involvesWith" : "",
                        "name" : "Text",
                        "location" : "??",
                        "date" : "YYYY-MM-DD"
                    }];
            });
    	},
        allDOMlist: function(){
            var loopLength = '';
            for (var i = myListDB.length - 1; i >= 0; i--) {
                loopLength += " " + i;
            };
            console.log('number of:', loopLength);
            $.each(myListDB, function(i, item){

                if ( i !== 0 ) {
                    toDomyList.itemHTML(i, item);
                }
                // $('#assignmentList').html($('#template'));
                // you need the templte!!!!!
            });
        },
        itemHTML: function (i, item){
            var checked = item.done ? 'checked' : '',
                input = '<input type="checkbox" name="fname" ' + checked + '>',
                chore = '<h2>' + item.name + '</h2>',
                choreDate = '<span class="date">' + item.date + '</span>';

            $('#assignmentList').append( 
                $("<div>", { 
                    'class': 'oneOfItem', 
                    'id': 'number' + i 
                }) 
            );
            $('#number' + i).html(  
                '<div class="editDiv">' +
                    '<button class="btnEdit" data-edit="' + i + '">Edit</button>' +
                    '<button class="btnDelete" data-delete="' + i + '">del</button>' +
                '</div>' +
                '<div class="textAssignment">' + 
                    '<div class="topic">' + input + chore + choreDate + '</div>' + 
                    '<div>' + item.assignment + '</div>' + 
                '</div>' );
        },
        itemID: function(){
            if( localStorage.getItem('index0') !== null ) { 
                console.log("Yes ID from - localStorage");
                listLength = ++JSON.parse(localStorage.getItem('index'+[ localStorage.length - 1 ])).id;
            } else {
                console.log("No ID from - localStorage");
                listLength = ++myListDB[ myListDB.length - 1 ].id;
            }
        }    
    };

    function openWindow(thePopUp) {
        popUp = thePopUp;
        $(popUp + ', #background').show();
    }
    function backgroundCloseOnClick() {
        $('#background, .close').on('click', function(e){
            backgroundCloseFunction();
        });
    }
    function backgroundClose(e) {
        backgroundCloseFunction();
    }
    function backgroundCloseFunction() {
        if ( this.nodeName === 'A' ) { e.preventDefault(); }
        $('.popUpAssignment .error').html('');
        $('#background, ' + popUp).hide();
    }
    function newListitem(){
        var month = thisDate.getMonth() >= 10 ? thisDate.getMonth() : 
                                                '0' + thisDate.getMonth(),
            day = thisDate.getDate() >= 10 ? thisDate.getDate() : 
                                            '0' + thisDate.getDate();
        thisTime = thisDate.getFullYear() + '-' + month + '-' + day;
        $('#newAssignmentDate').attr('value', thisTime );

        $('#newListItem').on('click', function(){
            openWindow('#newAssignment');
        });
        
        createNewAssignment();
    }
    function createNewAssignment() {
        $('#createBtnAssign').on('click', function(){
            if ( $('#newAssignmentName').val() === '' ){
                $('#newAssignment .error').html('You need to add text');
            } else {
                toDomyList.itemID();
                var newListObj = {
                    id:           listLength,
                    name:         toDomyList.dom.newAssignmentName.val(),
                    date:         toDomyList.dom.newAssignmentDate.val(),
                    assignment:   toDomyList.dom.newAssignmentText.val(),
                    done:         false,
                    involvesWith: "",
                    location:     ""
                };
                toDomyList.itemHTML(myListDB.length, newListObj);
                $('#newAssignment input[type="text"], #newAssignment textarea').val('');

                myListDB.push(newListObj);
                console.log(myListDB);

                alertMessage('new assignment to list', 2000);
            }
        });
    }
    function editListitem() {
        var arrayPosition;
        $('#editListItem').on('click', function() {
            if( !$('.oneOfItem .editDiv').is(':visible') ){
                $(this).text('Done editting');
            } else {
                $(this).text('Eidt Assignment');
            }
            $('.oneOfItem .editDiv, .oneOfItem .textAssignment')
                .toggleClass('show');
        });

        $('#wrapper').on('click', '.btnEdit', function () {
            var editItem = myListDB[$(this).attr('data-edit')];
            arrayPosition = $(this).attr('data-edit');

            console.log("this button: ", editItem);
            toDomyList.dom.editAssignmentName.val(editItem.name);
            toDomyList.dom.editAssignmentText.val(editItem.assignment);
            toDomyList.dom.editAssignmentDate.attr('value', editItem.date);
            thisTime = editItem.date;
            

            openWindow('#editAssignment');
        });

        $('#editBtnAssign').on('click', function (argument) {
            var textChange = myListDB[arrayPosition];

            if ( toDomyList.dom.editAssignmentName.val() === '' ){
                $('#editAssignment .error').html('You need to add text');
            } else {
                if( (textChange.name === toDomyList.dom.editAssignmentName.val()) && 
                    (textChange.assignment === toDomyList.dom.editAssignmentText.val()) 
                ){
                    alertMessage('No change in the text', 3000);
                } else {
                    console.log("not");
                    
                    changeDBitem(arrayPosition);

                    $('#number'+ arrayPosition + ' .textAssignment h2').text(textChange.name);
                    $('#number'+ arrayPosition + ' .textAssignment date').text(textChange.date);
                    $('#number'+ arrayPosition + ' .textAssignment > div:not(.topic)').text(textChange.assignment);

                    backgroundClose();
                    alertMessage('Text change', 2000);
                }
            }
        });
    }
    function deleteAssignment() {
        $('#wrapper').on('click', '.btnDelete', function () {
            var $this = $(this),
                deleteItem = $this.attr('data-delete');
            console.log(myListDB[deleteItem]);
            delete myListDB[deleteItem]; // ?????
            console.log(myListDB);
            $this.parents('.oneOfItem').remove();
        });
    }
    function changeDBitem(arrayPosition) {
        var textChange = myListDB[arrayPosition];

        textChange.name =       toDomyList.dom.editAssignmentName.val();
        textChange.assignment = toDomyList.dom.editAssignmentText.val();
        textChange.date =       toDomyList.dom.editAssignmentDate.val();
        console.log(textChange);
        if(localStorage.getItem('index0') !== null){
            localStorage.setItem('index' + arrayPosition, JSON.stringify(textChange));
        }
    }
    function localStorageDB(){
        if ( typeof(Storage) !== "undefined" ) {
            localStorage.clear();
            var loopLength = '';
            for (var i = 0; i < myListDB.length; i++) {
                loopLength += ' ' + i;
                console.log(i);
                var tmp = myListDB[i];
                localStorage.setItem('index' + i, JSON.stringify(tmp));
            };
            console.log('number of:', loopLength);
        } else {
            alertMessage('Sorry! No Web Storage support..', 2000);
        }
    }
    function alertMessage(text, time){
        time = time || 1000;
        text = text || 'default text'

        $('.close').parent().hide();
        toDomyList.dom.background.show();
        toDomyList.dom.background.after($("<div>", {
            'class': 'alertDiv',
            'text': text
        }));
        setTimeout(function (argument) {
            toDomyList.dom.background.hide();
            $('.alertDiv').remove();
        },time);
    }
    function setOrderBy () {
        $('#orderBy > span').on('click', function(){ $('#orderBy > div').toggleClass('show'); });
        
        $('#orderBy li:nth-child(1), #orderBy li:nth-child(2)').on('click', function(){ 
            var text = $(this).children('span');
            text.text() === "A - Z" ? text.text("Z - A") : text.text("A - Z");
            console.log($(this).text());
            domFilter(this);
        });

        $('#orderBy li').eq('2').on('click', function(){
            $(this).toggleClass('top');
            domFilter(this);
        });
        function domFilter (a){
            console.log('filter: ', $(a).data('search'));
            for (var i = myListDB.length - 1; i > 0; i--) {
                console.log(myListDB[i].date.split('-').join().replace(/,/g,''));
            };
        }
    }

    window.myLists = toDomyList;
})();

$(function(){
	myLists.init();
});

