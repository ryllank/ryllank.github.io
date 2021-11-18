//============================================================================
// Project:    SimpleX
// Module:     
// File:       editactions.js
// 
// SimpleX edit actions functions.
// 
// Copyright (C) Ryllan Kraft. 2002-2003.  All rights reserved.
//============================================================================

var defaultOutputText = 'Output text';

function listActions()
{
//alert('listActions suppressOnload='+suppressOnload+' top.editPage='+top.editPage);
    if (!suppressOnload)
    {
        suppressOnload = false;
        var replace = false;
        if (top.editPage == 'Actions') replace = true;
        var str = listActionsPage();
        setMainPage(str, replace);
    }
    suppressOnload = false;
}

function termListActions()
{
    if (!suppressOnunload)
    {
        var main = top.frames["main"];
        if (main)
        {
            var str = invalidActions();
            if (str)
            {
                alert('Invalid actions:' + str);
                listActions();
            }
            else
            {
                if (isChanged(main.document.frmIO))
                {
                    var str = 'Do you want to save the changes to these actions';
                    var ans = confirm(str);
                    if (ans)
                    {
                        updateActions(true/*dontRedraw*/);
                    }
                }
            }
        }
    }
    suppressOnunload = false;
}

function listActionsPage()
{
    //var str = pageHeader('Actions', false, 'top.termListActions()');
    var str = pageHeader('Actions', 'top.listActions()', 'top.termListActions()');
    str += '<form name="frmIO" onclick="top.handleChanges()" onkeyup="top.handleChanges()">\n';
    str += '<p>KB <input type="text" name="txtKB" value="' + kb.name + '"></p>';
    if (kb.actions.length == 0)
    {
        str += '<p><a href="javascript:top.addAction(0)">';
        str += '<img src="add.gif" alt="Add action"></a></p>\n';
    }
    else
    {
        str += '<table border="1">\n';
        for (var a in kb.actions)
        {
            str += genListAction(a);
        }
        str += '</table><br>\n';
    }
    str += '<input type="button" name="btnUpdate" value="Update" disabled' + 
           ' onclick="top.updateActions()">\n';
    str += '&nbsp;<input type="button" name="btnReset" value="Reset" disabled' +
           ' onclick="top.resetActions()">\n';
    str += '</form>\n';
    str += '</body>\n</html>\n';
    return str;
}

function genListAction(a)
{
    var str = '';
    var action = kb.actions[a];
    str += '<tr><td><a href="javascript:top.deleteAction('+a+')">';
    str += '<img src="delete.gif" alt="Delete action"></a></td>';
    str += '<td>action</td>';
    var type = action.type;
    str += '<td>' + genSelectActionType(type, a) + '</td>';
    if (type == 'consider')
    {
        var dname = action.attributes[0];
        str += '<td>' + genSelectDataitem(dname, 'consider', a) + '</td>';
    }
    else
    {
        str += '<td></td>';
    }
    str += '<td></td><td></td><td><a href="javascript:top.moveAction('+a+')">';
    str += '<img src="'+moveimage(a,kb.actions.length)+'" alt="Move action"></a></td>';
    str += '<td><a href="javascript:top.addAction('+a+')">';
    str += '<img src="add.gif" alt="Add action"></a></td><tr>\n';
    if (type == 'output')
    {
        if (action.attributes.length > 0)
        {
            for (i in action.attributes)
            {
                str += '<tr><td></td>';
                str += '<td><a href="javascript:top.deleteOutputItem('+a+', '+i+')">';
                str += '<img src="delete.gif" alt="Delete item"></a></td>';
                var at = action.attributes[i];
                if (!at) at = '';
                var item = 'text'
                if ((typeof(at) == "object") && (at.isa == "Valueof"))
                {
                    item = 'data';
                }
                str += '<td>'+genSelectOutputItem(item, a, i)+'</td>';
                if (item == 'text')
                {
                    str += '<td><input type="text" name="txtActItm'+a+'_'+i+'"';
                    str += ' value="' + at + '" style="width:100%"></td>';
                }
                else //data
                {
                    str += '<td>'+genSelectDataitem(at.dataname, 'output', i, a) + '</td>';
                }
                str += '<td><a href="javascript:top.moveOutputItem('+a+', '+i+')">';
                str += '<img src="'+moveimage(i,action.attributes.length)+'" alt="Move item"></a></td>';
                str += '<td><a href="javascript:top.addOutputItem('+a+', '+i+')">';
                str += '<img src="add.gif" alt="Add item"></a></td><td></td><tr>\n';
            }
        }
        else
        {
            alert('genListAction: Must have output attribute(s)');
        }
    }
    return str;
}

function genSelectActionType(type, a)
{
    var str = '';
    if (!member(type, ['consider', 'output', 'pause']))
    {
        alert('genSelectActionType: Action type not a valid one');
    }
    var selnName = 'selType';
    selnName = selnName + a;
    str += '<select name="' + selnName + '"' +
           ' onchange="top.changedActionType(this, '+a+')">';
    str += '<option';
    if (type == 'consider') str += ' selected';
    str += '>consider';
    str += '<option';
    if (type == 'output') str += ' selected';
    str += '>output';
    str += '<option';
    if (type == 'pause') str += ' selected';
    str += '>pause</select>';
    return str;
}

function genSelectOutputItem(item, a, ix)
{
    var str = '';
    if (!member(item, ['text', 'data']))
    {
        alert('genSelectOutputItem: Item not a valid one');
    }
    var selnName = 'selItem';
    selnName = selnName + a + '_' + ix;
    str += '<select name="' + selnName + '"' +
           ' onchange="top.changedOutputItem(this, '+a+','+ix+')">';
    str += '<option';
    if (item == 'text') str += ' selected';
    str += '>text';
    str += '<option';
    if (item == 'data') str += ' selected';
    str += '>data';
    str += '</select>';
    return str;
}

function deleteAction(a)
{
    var str = 'Are you sure you want to delete this action';
    var ans = confirm(str);
    if (ans)
    {
        if (isChanged(main.document.frmIO))
        {
            updateActions(true/*dontRedraw*/);
        }
        kb.actions = remove(a, kb.actions);
        compileKB(); // May have removed dataitems.
        listActions();
    }
}

function addAction(a)
{
    if (isChanged(main.document.frmIO))
    {
        updateActions(true/*dontRedraw*/);
    }
    kb.actions = insert(a, kb.actions, new Action('output', [defaultOutputText]));
    compileKB(); // May have removed dataitems.
    listActions();
}

function moveAction(a)
{
    if (isChanged(main.document.frmIO))
    {
        updateActions(true/*dontRedraw*/);
    }
    kb.actions = moveitem(a, kb.actions);
    listActions();
}

function changedActionType(seln, a)
{
    var typ = seln.options[seln.selectedIndex].text;
    if (isChanged(main.document.frmIO))
    {
        updateActions(true/*dontRedraw*/);
    }
    if ((typ == 'consider') && !getDataitem(0))
    {

        alert('Action \'consider\' has to have one or more data items\n' +
              '(define these in rules or requests)');
    }
    else
    {
        kb.actions[a].type = typ;
        var atts;
        if (typ == 'output') atts = [defaultOutputText];
        else if (typ == 'consider') atts = [getDataitem(0)];
        else if (typ == 'pause') atts = [];
        kb.actions[a].attributes = atts;
    }
    listActions();
}

function deleteOutputItem(a, i)
{
    var action = kb.actions[a];
    if (action.attributes.length == 1)
    {
        alert('Action \'output\' must have an output item');
    }
    else
    {
        var str = 'Are you sure you want to delete this item from the action';
        var ans = confirm(str);
        if (ans)
        {
            if (isChanged(main.document.frmIO))
            {
                updateActions(true/*dontRedraw*/);
            }
            action.attributes = remove(i, action.attributes)
            compileKB(); // May have removed dataitems.
            listActions();
        }
    }
}

function addOutputItem(a, i)
{
    if (isChanged(main.document.frmIO))
    {
        updateActions(true/*dontRedraw*/);
    }
    var action = kb.actions[a];
    action.attributes = insert(i, action.attributes, defaultOutputText);
    listActions();
}

function moveOutputItem(a, i)
{
    if (isChanged(main.document.frmIO))
    {
        updateActions(true/*dontRedraw*/);
    }
    var action = kb.actions[a];
    action.attributes = moveitem(i, action.attributes);
    listActions();
}

function changedOutputItem(seln, a, ix)
{
    if (isChanged(main.document.frmIO))
    {
        updateActions(true/*dontRedraw*/);
    }
    var item = seln.options[seln.selectedIndex].text;
    if ((item == 'data') && !getDataitem(0))
    {
        alert('Action \'output data\' has to have one or more data items\n' +
              '(define these in rules or requests)');
    }
    else
    {
        if (item == 'text')
        {
            kb.actions[a].attributes[ix] = defaultOutputText;
        }
        else if (item == 'data')
        {
            kb.actions[a].attributes[ix] = new Valueof(getDataitem(0).dataname);
        }
    }
    listActions();
}

function resetActions()
{
    listActions();
}

function invalidActions()
{
    var str = '';
/******************************************************************************
    var form = top.frames["main"].document.frmIO;
    if (form)
    {
        with (form)
        {
            for (var a in kb.actions)
            {
                var action = kb.actions[a];
                var typ;
                var elm = elements['selType'+a];
                if (elm) typ = elm.options[elm.selectedIndex].text;
                if (!typ || typ == '-')
                {
                    str += '\nAction';
                    if (a)
                    {
                        var index = Number(a) + 1;
                        str += ' ' + index;
                    }
                    str += ' needs valid action type';
                }
                if (typ == 'consider')
                {
                    elm = elements['selDataCons'+a];
                    var dname;
                    if (elm) dname = elm.options[elm.selectedIndex].text;
                    if (!dname)
                    {
                        str = '\nAction';
                        if (a)
                        {
                            var index = Number(a) + 1;
                            str += ' ' + index;
                        }
                        str += ' \'consider\' needs valid dataname';
                    }
                }
            }
        }
    }
******************************************************************************/
    return str;
}

function updateActions(dontRedraw)
{
    var form = top.frames["main"].document.frmIO;
    if (form)
    {
        var str = invalidActions();
        if (str)
        {
            alert('Invalid actions:' + str);
            dontRedraw = false;
        }
        else
        {
            with (form)
            {
                // Dont change selections: action type, output item. 
                // Change texts: KB name, output text.
                // Change selections: consider data, output item data.

                kb.name = elements['txtKB'].value;
                for (var a in kb.actions)
                {
                    var actn = kb.actions[a];
                    if (actn.type == 'consider')
                    {
                        elm = elements['selDataCons'+a];
                        var dname;
                        if (elm) dname = elm.options[elm.selectedIndex].text;
                        if (dname && (dname != newDataitemText))
                        {
                            actn.attributes[0] = dname;
                        }
                    }
                    else if (actn.type == 'output')
                    {
                        if (actn.attributes.length > 0)
                        {
                            for (i in actn.attributes)
                            {
                                var at = actn.attributes[i];
                                if ((typeof(at) == "object") && (at.isa == "Valueof"))
                                {
                                    elm = elements['selDataOut'+i+'_'+a];
                                    var dname;
                                    if (elm) dname = elm.options[elm.selectedIndex].text;
                                    if (dname && (dname != newDataitemText))
                                    {
                                        actn.attributes[i].dataname = dname;
                                    }
                                }
                                else // text
                                {
                                    elm = elements['txtActItm'+a+'_'+i];
                                    actn.attributes[i] = elm.value;
                                }
                            }
                        }
                        else
                        {
                            alert('updateActions: Must have output attribute(s)');
                        }
                    }
                }
            }
        }
    }
    if (!dontRedraw)
    {
        listActions();
    }
}
