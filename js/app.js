//check div id of node
function checkDivId(node) {
    let id = node.parentNode.parentNode.parentNode.id;
    return id?id:'content';
};

//return number from div id (i.e. 'id2' -> 2)
function checkIdNumber(id) {
    id = parseInt(id.replace( /^\D+/g, ''));
    return id?id:0;
}

var idbApp = (function() {
    
    /* check if indexedDb is supported */
    if (!('indexedDB' in window)) {
        alert('This browser doesn\'t support IndexedDB.');
    }

    /* create database, store and index */
    var dbPromise = idb.open('form-builder', 1, function(upgradeDb) {
        upgradeDb.createObjectStore('questions', {keyPath: 'id'});
        let store = upgradeDb.transaction.objectStore('questions');
        store.createIndex('parentId', 'parentId');
    });

    
    /* put item into the database */
    function putItem(item) {
        dbPromise.then(db => {
            let tx = db.transaction('questions', 'readwrite');
            let store = tx.objectStore('questions');
            store.put(item);
            return tx.complete;
        });
    }

    let nextQuestionId = 1;
    /* display all items that are already inside the database */
    function displayAllItems() {
        dbPromise.then(db => {
            return db.transaction('questions')
                .objectStore('questions').getAll();
            }).then(allItems => {
                if(allItems.length) {
                    nextQuestionId = Math.max.apply(Math, allItems.map(item => { return item.id; }))+1; /* get max from all ids in existing records */
                }
                allItems.map(item => {
                    parentId = item.parentId?`id${item.parentId}`:'content';
                    displayForm(parentId, item.id, item.type, item.question, item.conditionType, item.conditionValue); /* display form with data from the database */
                });
            });
    }
    displayAllItems();

    /* delete item from the database */
    function deleteItem(id) {
        dbPromise.then(db => {
            let tx = db.transaction('questions', 'readwrite');
            let store = tx.objectStore('questions');
            store.delete(id);
            return tx.complete;
        });
    }

    /* updates condition part of forms in children if parent type has changed */
    function updateChildIfParentTypeChanged(parentId, parentType) {
        dbPromise.then(db => {
            let tx = db.transaction('questions', 'readwrite');
            let store = tx.objectStore('questions');
            store.get(parentId).then(parentItem => {
                if(parentItem.type !== parentType) { /* if type has changed */
                    let index = store.index('parentId');
                    index.getAll(parentId).then(items => {
                        if(items.length) { /* if form has children */
                            items.map(item => {
                                div = document.getElementById(`id${item.id}`).getElementsByClassName('condition')[0];
                                parentForm = div.parentNode;
                                parentForm.removeChild(div); /* remove current condition part */
                                item.conditionType = 'equals';
                                item.conditionValue = '';
                                parentForm.insertAdjacentHTML('afterbegin', subBlock(parentType, item.conditionType, item.conditionValue)); /* attach new condition part */
                                readData(`id${item.id}`); /* update database record of childs form */
                            })
                        }
                    });
                }
            });
            return tx.complete;
        });
    }

    /* display form on the page */
    function displayForm(parentId, id, type = '', question = '', conditionType = '', conditionValue = ''){
        document.getElementById(parentId).insertAdjacentHTML('beforeend', formBlock(id, type, question)); /* display new form block */
        if(parentId !== 'content') { /* if the form should contain 'condition' part */
            let parentSelectElementValue = document.getElementById(parentId).getElementsByClassName('type')[0];
            let parentType = parentSelectElementValue.options[parentSelectElementValue.selectedIndex].value;
            document.getElementById('id'+id).firstElementChild.insertAdjacentHTML('afterbegin', subBlock(parentType, conditionType, conditionValue)); /* attach the condition part */
        }
    }

    /* when clicked button 'add' */
    function addForm(parentId){
        displayForm(parentId, nextQuestionId);
        readData('id'+nextQuestionId, true); 
        nextQuestionId++;
    }

    /* when clicked button 'delete' */
    function deleteForm(divId){
        deleteItem(checkIdNumber(divId)); /* delete item from the database */
        let node = document.getElementById(divId);
        children = node.getElementsByClassName('formBlock');
        for(let i = 0; i<children.length;i++) {
            deleteItem(checkIdNumber(children[i].id)); /* delete all it's children */
        }
        node.parentNode.removeChild(node); /* remove form from the page */
    }

    /* send current data to the database on every change in the form */
    function readData(divId, ifJustCreated = false) {
        let div = document.getElementById(divId);
        let form = div.firstElementChild;
        if(form.className === 'form') {
            /* create empty item object */
            let item = {
                id: 0,
                question: '',
                type:  '',
                parentId: 0,
                conditionType: '',
                conditionValue: ''
            }

            /* input values into the item */
            item.id = checkIdNumber(divId);
            item.question = form.getElementsByClassName('question')[0].value;
            item.type = form.getElementsByClassName('type')[0].value;
            item.parentId = checkIdNumber(div.parentNode.id);
    
                /* if the form has condition part */
            let conditionRow = form.getElementsByClassName('condition')[0];
            if(conditionRow) {
                let conditionTypeSelect = conditionRow.getElementsByClassName('conditionType')[0];
                item.conditionType = conditionTypeSelect.options[conditionTypeSelect.selectedIndex].value;
                
                if(conditionRow.getElementsByClassName('conditionValueText')[0]) {
                    item.conditionValue = conditionRow.getElementsByClassName('conditionValueText')[0].value;
                } else if(conditionRow.getElementsByClassName('conditionValueNumber')[0]) {
                    item.conditionValue = conditionRow.getElementsByClassName('conditionValueNumber')[0].value;
                } else if(conditionRow.getElementsByClassName('conditionValueSelect')[0]) {
                    let conditionTypeSelect = conditionRow.getElementsByClassName('conditionValueSelect')[0];
                    item.conditionValue = conditionTypeSelect.options[conditionTypeSelect.selectedIndex].value;
                }
                
            }

            if(!ifJustCreated) updateChildIfParentTypeChanged(item.id, item.type); /* if form was just created, it for sure doesn't have any children */
            putItem(item);
        }
    }

    return {
        addForm: (addForm),
        deleteForm: (deleteForm),
        readData: (readData),
        dbPromise: (dbPromise)
    };
})();