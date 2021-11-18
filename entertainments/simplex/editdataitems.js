//============================================================================
// Project:    SimpleX
// Module:     
// File:       editdataitems.js
// 
// SimpleX edit dataitems functions.
// 
// Copyright (C) Ryllan Kraft. 2002.  All rights reserved.
//============================================================================

function listDataitems()
{
//alert('listDataitems suppressOnload='+suppressOnload+' top.editPage='+top.editPage);
    if (!suppressOnload)
    {
        suppressOnload = false;
        var replace = false;
        if (top.editPage == 'Dataitems') replace = true;
        var str = listDataitemsPage();
        setMainPage(str, replace);
    }
    suppressOnload = false;
}

function termListDataitems()
{
//alert('termListDataitems suppressOnunload='+suppressOnunload+' top.editPage='+top.editPage);
    if (!suppressOnunload)
    {
        var main = top.frames["main"];
        if (main)
        {
            if (isChanged(main.document.frmIO))
            {
                var str = 'Do you want to save the changes to these dataitems';
                var ans = confirm(str);
                if (ans)
                {
                    updateDataitems(true/*dontRedraw*/);
                }
            }
        }
    }
    suppressOnunload = false;
}

function listDataitemsPage()
{
    var str = pageHeader('Dataitems', 'top.listDataitems()', 'top.termListDataitems()');
    str += '<form name="frmIO" onclick="top.handleChanges()" onkeyup="top.handleChanges()">\n';
    str += '<table border="1">\n';
    for (var dataname in dataitems)
    {
        var dataitem = dataitems[dataname];
        var val = dataitem.value;
        if (typeof(val) == "undefined") val = '';
        str += '<tr><td>' + dataname + '</td>';
        str += '<td><input type="text" value="' + val + '"></td>';
        src = dataitem.source;
        if (!src) src = '';
        if ((typeof(src) == "object") && (src.isa == "Rule"))
        {
            if (src.rulename) src = 'rule "' + src.rulename + '"';
            else src = 'rule';
        }
        str += '<td>' + src + '</td></tr>\n';
    }
    str += '</table><br>\n';
    str += '<input type="button" name="btnUpdate" value="Update" disabled' + 
           ' onclick="top.updateDataitems()">\n';
    str += '&nbsp;<input type="button" name="btnReset" value="Reset" disabled' +
           ' onclick="top.resetDataitems()">\n';
    str += '&nbsp;<input type="button" value="Clear" onclick="top.clearDataitems()">\n';
    str += '</form>\n';
    str += '</body>\n</html>\n';
    return str;
}

function resetDataitems()
{
    listDataitems();
}

function clearDataitems()
{
    for (i in dataitems)
    {
        clearDataitem(dataitems[i]);
    }
    listDataitems();
}

function updateDataitems(dontRedraw)
{
    var main = top.frames["main"];
    if (main)
    {
        var i = 0;
        for (var dataname in dataitems)
        {
            var dataitem = dataitems[dataname];
            var curVal = dataitem.value;
            var newVal;
            var input = main.document.forms['frmIO'].elements[i];
            if (input)
            {
                if (input.value != input.defaultValue)
                {
                    clearDataitem(dataitem);
                    newVal = input.value;
                    if (newVal) setDataitem(dataitem, newVal, 'set');
                }
            }
            i++;
        }
    }
    if (!dontRedraw)
    {
        listDataitems();
    }
}
