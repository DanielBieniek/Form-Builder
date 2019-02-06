function formBlock(id, type, question) {
    return `
<div class="formBlock" id="id${id}">
    <div class="form">
        <div class="row">
            <span>Question</span>
            <input type="text" class="question" onchange="idbApp.readData(checkDivId(this))" value="${question}">
        </div>
        <div class="row">
            <span>Type</span>
            <select class="type" onchange="idbApp.readData(checkDivId(this))">
                <option value="text" ${type=='text'?'selected':''}>Text</option>
                <option value="number" ${type=='number'?'selected':''}>Number</option>
                <option value="radio" ${type=='radio'?'selected':''}>Yes / No</option>
            </select>
        </div>
        <div class="row buttons">
            <button type="button" onclick="idbApp.addForm(checkDivId(this))">Add Sub-Input</button>
            <button type="button" onclick="idbApp.deleteForm(checkDivId(this))">Delete</button>
        </div>
    </div>
</div>`;
}

function subBlock(parentType, type, value) {
    let divHTML = `
        <div class="row condition">
            <span>Condition</span>`;
    switch(parentType) {
        case 'text':
            divHTML += `
                <select class="conditionType" onchange="idbApp.readData(checkDivId(this))">
                    <option value="equals" ${type=='equals'?'selected':''}>Equals</option>
                </select>
                <input type="text" class="conditionValueText" onchange="idbApp.readData(checkDivId(this))" value="${value}">`;
            break;
        case 'number':
            divHTML += `
                <select class="conditionType" onchange="idbApp.readData(checkDivId(this))">
                    <option value="equals" ${type=='equals'?'selected':''}>Equals</option>
                    <option value="greater" ${type=='greater'?'selected':''}>Greater than</option>
                    <option value="less" ${type=='less'?'selected':''}>Less than</option>
                </select>
                <input type="number" class="conditionValueNumber" onchange="idbApp.readData(checkDivId(this))" value="${value}">`;
            break;
        case 'radio':
            divHTML += `
                <select class="conditionType" onchange="idbApp.readData(checkDivId(this))">
                    <option value="equals" ${type=='equals'?'selected':''}>Equals</option>
                </select>
                <select class="conditionValueSelect" onchange="idbApp.readData(checkDivId(this))">
                    <option value="yes" ${value=='yes'?'selected':''}>Yes</option>
                    <option value="no" ${value=='no'?'selected':''}>No</option>
                </select>`;
    }
    divHTML += `</div>`;
    return divHTML;
}