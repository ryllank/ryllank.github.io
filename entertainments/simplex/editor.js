//============================================================================
// Project:    SimpleX
// Module:     
// File:       editor.js
// 
// SimpleX editor functions.
// 
// Copyright (C) Ryllan Kraft. 2002-2003.  All rights reserved.
//============================================================================

var editPage;
var editRuleNr;
var suppressOnload;
var suppressOnunload;

function pageLinks(header)
{
//alert('pageLinks header='+header);
    var str = '';
    if (member(header, ['Rules', 'Requests', 'Edit Rule']))
    {
        str += '<a href="javascript:top.listActions()" target="main">Actions</a> ';
    }
    if (member(header, ['Actions', 'Requests', 'Edit Rule']))
    {
        str += '<a href="javascript:top.listRules()" target="main">Rules</a> ';
    }
    if (member(header, ['Actions', 'Rules', 'Edit Rule']))
    {
        str += '<a href="javascript:top.listRequests()" target="main">Requests</a> ';
    }
    if (str)
    {
        str = '&nbsp;&nbsp;&nbsp;<span class="linkText">' + str + '</span>';
    }
    return str;
}

function pageHeader(header, loadfn, unloadfn)
{
    editPage = header;
    var str = '';
    str += '<html>\n';
    str += '<head>\n';
    str += '<title>SimpleX ' + header + '</title>\n';
    str += '<link rel="stylesheet" type="text/css" href="simplex.css">\n';
    str += '</head>\n';
    str += '<body';
    if (unloadfn) str += ' onunload="' + unloadfn + '"';
    if (loadfn) str += ' onload="' + loadfn + '"';
    //str += ' onload="top.reloadPage()"';
    str += '>\n';
    str += '<h1>' + header + pageLinks(header) + '</h1>\n';
    return str;
}

function setMainPage(str, replace)
{
    if (replace)
    {
        suppressOnunload = true;
    }
    suppressOnload = true;
    var main = top.frames["main"];
    if (main)
    {
        if (!replace)
        {
            main.document.open('text/html');
        }
        else
        {
            main.document.open('text/html', 'replace');
        }
	    main.document.writeln(str);
	    main.document.close();
    }
    suppressOnunload = false;
}

function handleChanges()
{
    var form = top.frames["main"].document.frmIO;
//alert('handleChanges form='+form);
    if (form)
    {
        var update = form.elements['btnUpdate'];
        var reset = form.elements['btnReset'];
        changed = isChanged(form);
//alert('handleChanges changed='+changed);
        if (changed)
        {
            if (update) update.disabled = false;
            if (reset) reset.disabled = false;
        }
        else
        {
            if (update) update.disabled = true;
            if (reset) reset.disabled = true;
        }
    }
}

/*******************
function refreshPage()
{
alert('refreshPage page='+top.editPage);
    var str;
    if (top.editPage == 'Actions')
    {
        str = listActionsPage();
    }
    else if (top.editPage == 'Rules')
    {
        str = listRulesPage();
    }
    else if (top.editPage == 'Edit Rule')
    {
        str = editRulePage(top.editRuleNr);
    }
    else if (top.editPage == 'Requests')
    {
        str = listRequestsPage();
    }
    else if (top.editPage == 'Dataitems')
    {
        str = listDataitemsPage();
    }
    if (str)
    {
        setMainPage(str, true); //replace
    }
}
**********************/

/**********************
function reloadPage()
{
    if (!suppressOnload)
    {
        refreshPage();
    }
    suppressOnload = false;
}
**********************/

var newDataitemText = '-- New Dataitem --';
function genSelectDataitem(dataname, forItem, ix, upperix)
{
    var str = '';
    var selnName;
    if (forItem == 'conclusion') selnName = 'selDataConc';
    else if (forItem == 'condition') selnName = 'selDataCond';
    else if (forItem == 'request') selnName = 'selDataReq';
    else if (forItem == 'consider') selnName = 'selDataCons';
    else if (forItem == 'output') selnName = 'selDataOut';
    selnName = selnName + ix;
    if ((upperix) && ((forItem != 'condition') && (forItem != 'conclusion')))
    {
        selnName += '_' + upperix;
    }
    str += '<select name="' + selnName + 
           '" onchange="top.changedDataitem(this, \''+forItem+'\', '+ix+', '+upperix+')">';
    if (!dataname)
    {
//        str += '<option selected> ';
        alert('genSelectDataitem: Must have dataname for data selection');
    }
    for (var dname in dataitems)
    {
        str += '<option';
        if (dataname == dname) str += ' selected';
        str += '>' + dname;
    }
    // Allow a new dataitem (for some).
    if (member(forItem, ['condition', 'conclusion', 'request']))
    {
        str += '<option>' + newDataitemText;
    }
    str += '</select>';
    return str;
}

function changedDataitem(seln, forItem, ix, upperix)
{
//alert('changedDataitem seln='+seln+' forItem='+forItem+' ix='+ix+' upperix='+upperix);
    var reDraw = false;
    var selText = seln.options[seln.selectedIndex].text;
    var dname = selText;
    if (dname == newDataitemText) dname = '';
    if (selText == newDataitemText)
    {
        dname = prompt('Give name for the new data-item', '');
        if (dname)
        {
            if (isChanged(main.document.frmIO))
            {
                if ((forItem == 'condition') ||
                    (forItem == 'conclusion'))
                {
                    updateRule(upperix, true/*dontRedraw*/);
                }
                else if (forItem == 'request')
                {
                    updateRequests(true/*dontRedraw*/);
                }
                else if ((forItem == 'consider') ||
                         (forItem == 'output'))
                {
                    updateActions(true/*dontRedraw*/);
                }
            }
            if (forItem == 'condition')
            {
                kb.rules[upperix].conditions[ix].dataname = dname;
            }
            else if (forItem == 'conclusion')
            {
                kb.rules[upperix].conclusions[ix].dataname = dname;
            }
            else if (forItem == 'request')
            {
                kb.requests[ix].dataname = dname;
            }
            else if (forItem == 'consider')
            {
                kb.actions[ix].attributes[0] = dname;
            }
            else if (forItem == 'output')
            {
                kb.actions[upperix].attributes[ix] = new Valueof(dname);
            }
            compileKB(); // Have added dataitem.
            if ((forItem == 'condition') ||
                (forItem == 'conclusion'))
            {
                editRule(upperix, true/*replace*/);
            }
            else if (forItem == 'request')
            {
                listRequests(true/*replace*/);
            }
            else if (forItem == 'consider')
            {
                listActions(true/*replace*/);
            }
        }
        else
        {
            var opts = seln.options;
            for (var i = 0; i < opts.length; i++)
            {
                var opt = opts[i];
                if (opt.defaultSelected) opt.selected = true;
                else opt.selected = false;
            }
        }
    }
}
