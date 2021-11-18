//============================================================================
// Project:    SimpleX
// Module:     
// File:       editrules.js
// 
// SimpleX edit rules functions.
// 
// Copyright (C) Ryllan Kraft. 2002-2003.  All rights reserved.
//============================================================================

var defaultDataname = 'New Dataitem';
var defaultConclusionValue = 'A value';

function listRules()
{
//alert('listRules suppressOnload='+suppressOnload+' top.editPage='+top.editPage);
    if (!suppressOnload)
    {
        suppressOnload = false;
        var replace = false;
        if (top.editPage == 'Rules') replace = true;
        var str = listRulesPage();
        setMainPage(str, replace);
    }
    suppressOnload = false;
}

function termListRules()
{
    if (!suppressOnunload)
    {
        var main = top.frames["main"];
        if (main)
        {
            var str = invalidRules();
            if (str)
            {
                alert('Invalid rules:' + str);
                listRules();
            }
            else
            {
                if (isChanged(main.document.frmIO))
                {
                    var str = 'Do you want to save the changes to these rules';
                    var ans = confirm(str);
                    if (ans)
                    {
                        updateRules(true/*dontRedraw*/);
                    }
                }
            }
        }
    }
    suppressOnunload = false;
}

function listRulesPage()
{
    var str = pageHeader('Rules', 'top.listRules()', 'top.termListRules()');
//    var str = pageHeader('Rules');
    //str += '<form name="frmIO" onclick="top.handleChanges()" onkeyup="top.handleChanges()">\n';
    str += '<form name="frmIO">\n';
    if (kb.rules.length == 0)
    {
        str += '<p><a href="javascript:top.addRule(0)">';
        str += '<img src="add.gif" alt="Add rule"></a></p>\n';
    }
    else
    {
        str += '<table border="1">\n';
        for (var r in kb.rules)
        {
            str += genListRule(r);
        }
        str += '</table><br>\n';
    }
    str += '</form>\n';
    str += '</body>\n</html>\n';
    return str;
}

function genListRule(r)
{
    var str = '';
    var rule = kb.rules[r];
    var rulename = rule.rulename;
    if (typeof(rulename) == "undefined") rulename = '';
    str += '<tr><td><a href="javascript:top.deleteRule('+r+')">';
    str += '<img src="delete.gif" alt="Delete rule"></a></td>';
    str += '<td title="Edit rule"><a href="javascript:top.editRule('+r+')">rule</a></td>';
    str += '<td colspan="4">' + rulename + '</td>';
    str += '<td>';
    if (rule.defaultFlag)
    {
        str += '<small><small>Default</small></small>';
    }
    else
    {
        str += '&nbsp;';
    }
    str += '</td><td><a href="javascript:top.moveRule('+r+')">';
    str += '<img src="'+moveimage(r,kb.rules.length)+'" alt="Move rule"></a></td>';
    str += '<td><a href="javascript:top.addRule('+r+')">';
    str += '<img src="add.gif" alt="Add rule"></a></td><tr>\n'; //9cols
    var nr, len;
    with (rule)
    {
        nr = 0;
        len = conditions.length;
        for (var c in conditions)
        {
            var condition = conditions[c];
            nr++;
            with (condition)
            {
                str += '<tr><td></td>';
                str += '<td>';
                if (nr == 1) str += 'if';
                else         str += '&nbsp;'
                str += '<td>';
                if (negated) str += 'not';
                else         str += '&nbsp;';
                str += '</td><td>' + dataname + '</td>';
                str += '<td>';
                if (relation) str += relation;
                else          str += '&nbsp;';
                str += '</td><td>';
                if (value) str += value;
                else       str += '&nbsp;';
                str += '</td><tr>\n'; //7cols
            }
        }
        nr = 0;
        len = conclusions.length;
        for (c in conclusions)
        {
            var conclusion = conclusions[c];
            nr++;
            with (conclusion)
            {
                str += '<tr><td></td><td>';
                if ((nr == 1) && (conditions.length > 0))
                {
                    str += 'then';
                }
                else
                {
                    str += '&nbsp;'
                }
                str += '</td><td></td><td>' + dataname + '</td>';
                str += '<td>=</td>';
                str += '<td>';
                if (value) str += value;
                else       str += '&nbsp;';
                str += '</td><tr>\n'; //7cols
            }
        }
    }
    return str;
}

function deleteRule(r)
{
    var str = 'Are you sure you want to delete this rule';
    var rulename = kb.rules[r].rulename;
    if (rulename) str += ' "' + rulename + '"';
    var ans = confirm(str);
    if (ans)
    {
        if (isChanged(main.document.frmIO))
        {
            updateRules(true/*dontRedraw*/);
        }
        kb.rules = remove(r, kb.rules);
        compileKB(); // May have removed dataitems.
        listRules();
    }
}

function addRule(r)
{
//alert('addRule r='+r);
    if (isChanged(main.document.frmIO))
    {
        updateRules(true/*dontRedraw*/);
    }
    var dataitem = getDataitem(0);
    var dname = defaultDataname;
    if (dataitem) dname = dataitem.dataname;
    kb.rules = insert(r, kb.rules, new Rule('', false, [], 
        [new Conclusion(dname, defaultConclusionValue)]));
    compileKB(); // May have removed dataitems.
    listRules();
}

function moveRule(r)
{
    if (isChanged(main.document.frmIO))
    {
        updateRules(true/*dontRedraw*/);
    }
    kb.rules = moveitem(r, kb.rules);
    compileKB(); // Order effects inference.
    listRules();
}

function invalidRules()
{
    var str = '';
    // Dummy.
    return str;
}

function updateRules(dontRedraw)
{
    // Dummy.
    if (!dontRedraw)
    {
        listRules();
    }
}

function editRule(r)
{
//alert('editRule r='+r+' suppressOnload='+suppressOnload+' top.editPage='+top.editPage);
    if (!suppressOnload)
    {
        suppressOnload = false;
        var replace = false;
        if (top.editPage == 'Edit Rule') replace = true;
        var str = editRulePage(r);
        setMainPage(str, replace);
    }
    suppressOnload = false;
}

function termEditRule(r)
{
//alert('termEditRule no-term='+suppressOnunload);
    if (!suppressOnunload)
    {
        var main = top.frames["main"];
        if (main)
        {
            var str = invalidRule(r);
            if (str)
            {
                alert('Invalid rule:' + str);
                editRule(r);
            }
            else
            {
                if (isChanged(main.document.frmIO))
                {
                    var str = 'Do you want to save the changes to this rule';
                    var ans = confirm(str);
                    if (ans)
                    {
                        updateRule(r, true/*dontRedraw*/);
                    }
                }
            }
        }
    }
    suppressOnunload = false;
}

function editRulePage(r)
{
//alert('>editRule r='+r+)
    editRuleNr = r;
    var str = pageHeader('Edit Rule', 'top.editRule('+r+')', 
                         'top.termEditRule('+r+')');
    str += '<form name="frmIO" onclick="top.handleChanges()" onkeyup="top.handleChanges()">\n';
    str += '<table border="1">\n';
    str += genEditRule(r);
    str += '</table><br>\n';
    str += '<input type="button" name="btnUpdate" value="Update" disabled' + 
           ' onclick="top.updateRule('+r+')">\n';
    str += '&nbsp;<input type="button" name="btnReset" value="Reset" disabled' +
           ' onclick="top.resetRule('+r+')">\n';
    str += '</form>\n';
    str += '</body>\n</html>\n';
    return str;
}

function genEditRule(r)
{
    var str = '';
    var rule = kb.rules[r];
    var rulename = rule.rulename;
    if (typeof(rulename) == "undefined") rulename = '';
    str += '<tr><td>rule</td>';
    str += '<td colspan="5">';
    str += '<input type="text" name="txtName" value="' + rulename + '" style="width:100%">';
//    str += '</td><td></td><tr>\n';
    str += '</td><td colspan="2">';
    str += '<input type="checkbox" name="chkDefault"';
    if (rule.defaultFlag) str += ' checked';
    str += '><small><small>Default</small></small></td><tr>\n';
    var nr, len;
    with (rule)
    {
        nr = 0;
        len = conditions.length;
        if (len > 0)
        {
            for (var c in conditions)
            {
                var condition = conditions[c];
                nr++;
                with (condition)
                {
                    str += '<tr><td><a href="javascript:top.deleteCond('+r+','+c+')">';
                    str += '<img src="delete.gif" alt="Delete condition"></a></td>';
                    if (nr == 1) str += '<td>if</td>';
                    else         str += '<td>&nbsp;</td>'
                    str += '<td>' + genSelectNegated(negated, c) + '</td>';
                    str += '<td>' + 
                        genSelectDataitem(dataname, 'condition', c, r) + '</td>';
                    str += '<td>' + genSelectRelation(relation, c) + '</td>';
                    var val = value;
                    if (!val) val = '';
                    str += '<td><input type="text" name="txtValCond' + c;
                    str += '" value="' + val + '" style="width:100%"></td>';
                    str += '<td><a href="javascript:top.moveCond('+r+', '+c+')">';
                    str += '<img src="'+moveimage(c,conditions.length)+'" alt="Move condition"></a></td>';
                    str += '<td><a href="javascript:top.addCond('+r+', '+c+')">';
                    str += '<img src="add.gif" alt="Add condition"></a></td>';
                    str += '<tr>\n';
                }
            }
        }
        else
        {
            str += '<tr><td></td><td cols="5"><a href="javascript:top.addCond('+r+', 0)">';
                    str += '<img src="add.gif" alt="Add condition"></a></td>';
            str += '<td></td><td><tr>\n';
        }
        nr = 0;
        len = conclusions.length;
        if (len > 0)
        {
            for (c in conclusions)
            {
                var conclusion = conclusions[c];
                nr++;
                with (conclusion)
                {
                    str += '<tr><td><a href="javascript:top.deleteConc('+r+','+c+')">';
                    str += '<img src="delete.gif" alt="Delete conclusion"></a></td>';
                    if ((nr == 1) && (conditions.length > 0))
                    {
                        str += '<td>then</td>';
                    }
                    else
                    {
                        str += '<td>&nbsp;</td>'
                    }
                    str += '<td></td><td>' + 
                        genSelectDataitem(dataname, 'conclusion', c, r) + '</td>';
                    str += '<td>=</td>';
                    var val = value;
                    if (!val) val = '';
                    str += '<td><input type="text" name="txtValConc' + c;
                    str += '" value="' + val + '" style="width:100%"></td>';
                    str += '<td><a href="javascript:top.moveConc('+r+', '+c+')">';
                    str += '<img src="'+moveimage(c,conclusions.length)+'" alt="Move conclusion"></a></td>';
                    str += '<td><a href="javascript:top.addConc('+r+', '+c+')">';
                    str += '<img src="add.gif" alt="Add conclusion"></a></td>';
                    str += '<tr>\n';
                }
            }
        }
        else
        {
            alert('genEditRule: Must have rule conclusion(s)');
        }
    }
    return str;
}

function genSelectNegated(negated, c)
{
    var str = '';
    var selnName = 'selNeg';
    selnName = selnName + c;
    str += '<select name="' + selnName + '"><option';
    if (!negated) str += ' selected';
    str += '>&nbsp;&nbsp;&nbsp;<option';
    if (negated) str += ' selected';
    str += '>not</select>';
    return str;
}

function genSelectRelation(relation, c)
{
    var str = '';
    var selnName = 'selRel';
    selnName = selnName + c;
    str += '<select name="' + selnName + '"><option';
    if (!relation) str += ' selected';
    str += '>';
    for (var rel in relations)
    {
        str += '<option';
        if (relation == relations[rel][0]) str += ' selected';
        str += '>' + relations[rel][1];
    }
    str += '</select>';
    return str;
}

function resetRule(r)
{
    editRule(r);
}

function invalidRule(r)
{
    var str = '';
    var form = top.frames["main"].document.frmIO;
    if (form)
    {
        var rule = kb.rules[r];
        if (rule)
        {
            var c;
            with (form)
            {
                for (c in rule.conditions)
                {
                    str += invalidCond(form, rule, c);
                }
                for (c in rule.conclusions)
                {
                    str += invalidConc(form, rule, c);
                }
            }
        }
    }
    return str;
}

function invalidCond(form, rule, c)
{
    var str = '';
    with (form)
    {
        //Just check for valid dataname.
        var elm = elements['selDataCond'+c];
        var dname;
        if (elm) dname = elm.options[elm.selectedIndex].text;
        if (!dname)
        {
            str = '\nCondition';
            if (c)
            {
                var index = Number(c) + 1;
                str += ' ' + index;
            }
            str += ' needs valid dataname';
        }
    }
    return str;
}

function invalidConc(form, rule, c)
{
    var str = '';
    with (form)
    {
        //Just check for valid dataname.
        var elm = elements['selDataConc'+c];
        var dname;
        if (elm) dname = elm.options[elm.selectedIndex].text;
        if (!dname)
        {
            str = '\nConclusion';
            if (c)
            {
                var index = Number(c) + 1;
                str += ' ' + index;
            }
            str += ' needs valid dataname';
        }
    }
    return str;
}

function updateRule(r, dontRedraw)
{
    var form = top.frames["main"].document.frmIO;
    if (form)
    {
        var str = invalidRule(r);
        if (str)
        {
            alert('Invalid rule:' + str);
            dontRedraw = false;
        }
        else
        {
            var rule = kb.rules[r];
            if (rule)
            {
                var c;
                with (form)
                {
                    rule.rulename = txtName.value;
                    rule.defaultFlag = chkDefault.checked;
                    for (c in rule.conditions)
                    {
                        updateCond(form, rule, c);
                    }
                    for (c in rule.conclusions)
                    {
                        updateConc(form, rule, c);
                    }
                }
            }
        }
//alert(isChanged(main.document.frmIO));
        if (!dontRedraw)
        {
            editRule(r);
        }
    }
}

function updateCond(form, rule, c)
{
    var condition = rule.conditions[c];
    with (form)
    {
        var elm = elements['selDataCond'+c];
        condition.dataname = elm.options[elm.selectedIndex].text;;
        elm = elements['selNeg'+c];
        condition.negated = (elm.selectedIndex == 1);
        elm = elements['selRel'+c];
        condition.relation = elm.options[elm.selectedIndex].text;
        elm = elements['txtValCond'+c];
        condition.value = elm.value;
    }
}

function updateConc(form, rule, c)
{
    var conclusion = rule.conclusions[c];
    with (form)
    {
        var elm = elements['selDataConc'+c];
        conclusion.dataname = elm.options[elm.selectedIndex].text;;
        elm = elements['txtValConc'+c];
        conclusion.value = elm.value;
    }
}

function deleteCond(r, c)
{
    var str = 'Are you sure you want to delete this condition from the rule';
    var ans = confirm(str);
    if (ans)
    {
        if (isChanged(main.document.frmIO))
        {
            updateRule(r, true/*dontRedraw*/);
        }
        var rule = kb.rules[r];
        rule.conditions = remove(c, rule.conditions)
        compileKB(); // May have removed dataitems.
        editRule(r);
    }
}

function deleteConc(r, c)
{
    var rule = kb.rules[r];
    if (rule.conclusions.length == 1)
    {
        alert('Rule must have a conclusion');
    }
    else
    {
        var str = 'Are you sure you want to delete this conclusion from the rule';
        var ans = confirm(str);
        if (ans)
        {
            if (isChanged(main.document.frmIO))
            {
                updateRule(r, true/*dontRedraw*/);
            }
            rule.conclusions = remove(c, rule.conclusions)
            compileKB(); // May have removed dataitems.
            editRule(r);
        }
    }
}

function addCond(r, c)
{
//alert('addCond r='+r+' c='+c);
    if (isChanged(main.document.frmIO))
    {
        updateRule(r, true/*dontRedraw*/);
    }
    var rule = kb.rules[r];
    var dataitem = getDataitem(0);
    var dname = defaultDataname;
    if (dataitem) dname = dataitem.dataname;
    rule.conditions = insert(c, rule.conditions, 
        new Condition(dname, false, false, ''));
    compileKB();
    editRule(r);
}

function moveCond(r, c)
{
    if (isChanged(main.document.frmIO))
    {
        updateRule(r, true/*dontRedraw*/);
    }
    var rule = kb.rules[r];
    rule.conditions = moveitem(c, rule.conditions);
    compileKB(); // Order effects inference.
    editRule(r);
}

function addConc(r, c)
{
//alert('addConc r='+r+' c='+c);
    if (isChanged(main.document.frmIO))
    {
        updateRule(r, true/*dontRedraw*/);
    }
    var rule = kb.rules[r];
    var dataitem = getDataitem(0);
    var dname = defaultDataname;
    if (dataitem) dname = dataitem.dataname;
    rule.conclusions = insert(c, rule.conclusions, 
        new Conclusion(dname, defaultConclusionValue));
    compileKB();
    editRule(r);
}

function moveConc(r, c)
{
    if (isChanged(main.document.frmIO))
    {
        updateRule(r, true/*dontRedraw*/);
    }
    var rule = kb.rules[r];
    rule.conclusions = moveitem(c, rule.conclusions);
    compileKB(); // Order effects inference.
    editRule(r);
}
