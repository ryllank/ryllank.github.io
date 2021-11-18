//============================================================================
// Project:    SimpleX
// Module:     
// File:       inference.js
// 
// SimpleX inference functions.
// 
// Copyright (C) Ryllan Kraft. 2002-2003.  All rights reserved.
//============================================================================

var infProps;
if (!infProps) infProps = new infProperties();
function infProperties()
{
    this.resolution = 'first'; // or "quick", "specific", "random"
    this.selection = 'first'; // or "quick", "specific", "random"
    this.requestleaves = true;
    this.debugtrace = true;
}

var infTrace = '';
var infTraceLevel = 0;
var infTrail = [];

function setInfProperties(aResolution, aSelection, requestleavesFlg, debugtraceFlg)
{
    //if ((aResolution != 'first') || (aSelection != 'first'))
    //{
    //    alert('Currently only support \'first\' rule resolution\n' +
    //          'and \'first\' dataitem selection');
    //}
    infProps.resolution = aResolution;
    infProps.selection = aSelection;
    infProps.requestleaves = requestleavesFlg;
    infProps.debugtrace = debugtraceFlg;
}

function consider(dataitem)
{
    var state = 'undetermined'; // 'undetermined', 'succeeded', 'failed' or 'paused'
    infTraceLevel++;
    trace(traceLevel('>')+'considering "'+dataitem.dataname+'"');
//d()
    if (!dataitem.value && !dataitem.tried)
    {
        var trying = true;
        while (trying)
        {
            var rule = pickUnfiredRule(dataitem);
            if (rule)
            {
                state = invokeRule(dataitem, rule);
                if ((state == 'paused') ||
                    (state == 'succeeded') || (state == 'failed'))
                {
                    trying = false;
                }
            }
            else
            {
                trying = false;
                if (dataitem.request)
                {
                    state = invokeRequest(dataitem);
                }
                else
                {
                    if (infProps.requestleaves)
                    {
                        var isleaf = (dataitem.rulelist.length == 0);
                        if (isleaf)
                        {
                            state = invokeRequest(dataitem);
                        }
                    }
                }
            }
        }
    }
    else
    {
        if (dataitem.value) state = 'succeeded';
        else state = 'failed';
    }
    if (state != 'paused')
    {
//        dataitem.tried = true;
        var str = traceLevel('<')+'considered "'+dataitem.dataname+'"';
        str += ' state=' + state;
        if (state == 'succeeded') str += ' value="'+dataitem.value+'"';
        trace(str);
    }
    infTraceLevel--;
    return state;
}

function pickUnfiredRule(dataitem)
{
if (infProps.debugtrace)
  trace('!>pickUnfiredRule dataitem.dataname='+dataitem.dataname+
        ' infProps.resolution='+infProps.resolution);
    var rule;

    rule = pickUnfiredRuleDefaultCheck(dataitem, false /*allowDefault*/);

    if (!rule)
    {
        rule = pickUnfiredRuleDefaultCheck(dataitem, true /*allowDefault*/);
    }

if (infProps.debugtrace)
  trace('!<pickUnfiredRule rule='+rule);
    return rule;
}

function pickUnfiredRuleDefaultCheck(dataitem, allowDefault)
{
if (infProps.debugtrace)
  trace('!>pickUnfiredRuleDefaultCheck dataitem.dataname='+dataitem.dataname+
        ' infProps.resolution='+infProps.resolution+' allowDefault='+allowDefault);
    var rule;
    var curRule;
    var shortlist = [];
    with (dataitem)
    {
        for (var r in rulelist)
        {
            curRule = rulelist[r];
            if (!curRule.tried)
            {
if (infProps.debugtrace)
  trace('!*pickUnfiredRuleDefaultCheck curRule='+curRule+
        ' .default='+curRule.defaultFlag);
                if (allowDefault || !curRule.defaultFlag)
                {
                    if (infProps.resolution == "first")
                    {
                        rule = curRule;                     // First served.
                        break;
                    }
                    else
                    {
                        shortlist[shortlist.length] = curRule;
                    }
                }
            }
        }
        if (shortlist.length == 1)
        {
            rule = shortlist[0];
        }
        else if (shortlist.length > 1)
        {
            if ((infProps.resolution == "quick") ||
                (infProps.resolution == "specific"))
            {
                var count;
                curRule = false;
                for (var s in shortlist)
                {
                    var nr = shortlist[s].dependson.length;
                    if (infProps.resolution == "quick")         // Least dataitems.
                    {
                        if ((s == 0) || (nr < count))
                        {
                            count = nr;
                            curRule = shortlist[s];
                        }
                    }
                    else if (infProps.resolution == "specific") // Most dataitems.
                    {
                        if ((s == 0) || (nr > count))
                        {
                            count = nr;
                            curRule = shortlist[s];
                        }
                    }
                }
                if (curRule) rule = curRule;
//alert('*pickUnfiredRule quick/specific len='+shortlist.length+' nr='+nr);
            }
            else if (infProps.resolution == "random")
            {
                var nr = shortlist.length;
                var ix = nr * Math.random();
//alert('*pickUnfiredRule random nr='+nr+' ix='+ix);
                var ix = Math.floor(ix); if (ix == nr) ix--;
                rule = shortlist[ix];
            }
        }
    }
if (infProps.debugtrace)
  trace('!<pickUnfiredRuleDefaultCheck rule='+rule+' allowDefault='+allowDefault);
    return rule;
}

function invokeRule(dataitem, rule)
{
    var state = 'undetermined'; // 'undetermined', 'succeeded', 'failed' or 'paused'
    var condn;                  // 'undetermined', true, false or 'paused'
    var str = traceLevel('>')+'invoking rule';
    if (rule.rulename) str += ' "'+rule.rulename+'"';
    str += ' for "'+dataitem.dataname+'"';
    trace(str);

    condn = evalConditions(rule);
    if (condn == 'paused')
    {
        state = 'paused';
    }
    else if (condn == true)
    {
        rule.tried = true;
        appendTrail(rule);
        fireConclusions(rule);
        if (dataitem.value) state = 'succeeded';
    }
    else //if (condn == false) or undetermined or whathaveyou
    {
        rule.tried = true;
        appendTrail(rule);
    }

    if (state != 'paused')
    {
        str  = traceLevel('<')+'invoked rule';
        if (rule.rulename) str += ' "'+rule.rulename+'"';
        str += ' for "'+dataitem.dataname+'"';
        str += ' state=' + state;
        trace(str);
    }
    return state;
}

function evalConditions(rule)
{
if (infProps.debugtrace)
  trace('!>evalConditions rule='+rule);
    var condn = 'undetermined'; // 'undetermined', true, false or 'paused'
    var trying = true;
    while (trying)
    {
        condn = testConditions(rule);
        if (condn == 'undetermined')
        {
            var dataitem = pickFreshDataitem(rule);
            if (dataitem)
            {
                var state = consider(dataitem);
                if (state == 'paused')
                {
                    condn = 'paused';
                    trying = false;
                }
                if (state != 'succeeded')
                {
                    // We wont be able to establish condition on next test.
                    trying = false;
                }
            }
            else
            {
                // No more dataitems to try in this rule's conditions.
                trying = false;
            }
        }
        else
        {
            // Condition is established (true or false) [or 'paused'].
            trying = false;
        }
    }
if (infProps.debugtrace)
  trace('!<evalConditions condn='+condn);
    return condn;
}

function testConditions(rule)
{
if (infProps.debugtrace)
  trace('!>testConditions rule='+rule);
    var condn = 'undetermined'; // 'undetermined', true, false or 'paused'
    if (rule.conditions.length == 0)
    {
        condn = true;                   // No conditions - always valid.
    }
    else
    {
        for (var c in rule.conditions)
        {
            var condition = rule.conditions[c];
            with (condition)
            {
                if (!dataitem.value)
                {
                    condn = 'undetermined';
                    break;
                }
                else
                {
                    if (!relation)
                    {
//alert('!testConditions no-relation dataitem.value='+dataitem.value);
                        condn = (dataitem.value == 'true');
                    }
                    else
                    {
//alert('!testConditions relation='+relation+' dataitem.value='+dataitem.value+
//' value='+value);
                        switch (relation)
                        {
                            case "=" : condn = (dataitem.value == value); break;
                            case "!=": condn = (dataitem.value != value); break;
                            case ">" : condn = (dataitem.value >  value); break;
                            case "<" : condn = (dataitem.value <  value); break;
                            case ">=": condn = (dataitem.value >= value); break;
                            case "<=": condn = (dataitem.value <= value); break;
                        }
                    }
                    if (negated)
                    {
//alert('!testConditions negated');
                        if (condn == true) condn = false;
                        else if (condn == false) condn = true;
                    }
                    if (condn == false)
                    {
                        break;
                    }
                }
            }
        }
    }
if (infProps.debugtrace)
  trace('!<testConditions condn='+condn);
    return condn;
}

function pickFreshDataitem(rule)
{
if (infProps.debugtrace)
  trace('!>pickFreshDataitem rule='+rule+' infProps.selection='+infProps.selection);
    var dataitem;
    var curDataitem;
    var shortlist = [];
    with (rule)
    {
        for (var d in dependson)
        {
            curDataitem = dependson[d];
            if (!curDataitem.value && !curDataitem.tried)
            {
                if (infProps.selection == "first")
                {
                    dataitem = curDataitem;                     // First served.
                    break;
                }
                else
                {
                    shortlist[shortlist.length] = curDataitem;
                }
            }
        }
        if (shortlist.length == 1)
        {
            dataitem = shortlist[0];
        }
        else if (shortlist.length > 1)
        {
            if ((infProps.selection == "quick") ||
                (infProps.selection == "specific"))
            {
                var count;
                curDataitem = false;
                for (var s in shortlist)
                {
                    var nr = shortlist[s].rulelist.length;
                    if (infProps.selection == "quick")         // Least rules.
                    {
                        if ((s == 0) || (nr < count))
                        {
                            count = nr;
                            curDataitem = shortlist[s];
                        }
                    }
                    else if (infProps.selection == "specific") // Most rules.
                    {
                        if ((s == 0) || (nr > count))
                        {
                            count = nr;
                            curDataitem = shortlist[s];
                        }
                    }
                }
                if (curDataitem) dataitem = curDataitem;
alert('*pickFreshDataitem quick/specific len='+shortlist.length+' nr='+nr);
            }
            else if (infProps.selection == "random")
            {
                var nr = shortlist.length;
                var ix = nr * Math.random();
alert('*pickFreshDataitem random nr='+nr+' ix='+ix);
                var ix = Math.floor(ix); if (ix == nr) ix--;
                dataitem = shortlist[ix];
            }
        }
    }
if (infProps.debugtrace)
  trace('!<pickFreshDataitem dataitem='+dataitem);
    return dataitem;
}

function fireConclusions(rule)
{
if (infProps.debugtrace)
  trace('!>fireConclusions rule='+rule);
    for (var c in rule.conclusions)
    {
        var conclusion = rule.conclusions[c];
        var value = conclusion.value;
        if (!value) value = 'true';
        setDataitem(dataitems[conclusion.dataname], value, rule);
        appendTrail(dataitems[conclusion.dataname]);
    }
if (infProps.debugtrace)
  trace('!<fireConclusions');
}

function invokeRequest(dataitem)
{
    trace('?requesting "'+dataitem.dataname+'"');
    var state = 'undetermined'; // 'undetermined', 'succeeded', 'failed' or 'paused'
    if (typeof(uiRequest) == "function")
    {
        state = uiRequest(dataitem);
    }
    else
    {
        state = internalRequest(dataitem);
    }
    trace('?requested "'+dataitem.dataname+'" state='+state);
    return state;
}

function internalRequest(dataitem)
{
if (infProps.debugtrace)
  trace('!>internalRequest dataitem.dataname='+dataitem.dataname);
    var state = 'undetermined'; // 'undetermined', 'succeeded', 'failed' or 'paused'
    var msg;
    msg = 'Give a value for "' + dataitem.dataname + '"';
    var ansStyle;
    var ansValues;
    if (dataitem.request)
    {
        with (dataitem.request)
        {
            if (prompt)
            {
                msg = prompt;
            }
            ansStyle = style;
            if (ansStyle == 'yesno')
            {
                ansValues = ['true', 'false'];
                msg += '\nAnswer Yes or No (true or false)';
            }
            else if (ansStyle == 'oneof')
            {
                ansValues = attributes;
                msg += '\nAnswer one of:';
                for (var a in ansValues)
                {
                    msg += ' ' + ansValues[a];
                }
            }
        }
    }
    var asking = true;
    while (asking)
    {
        var ans = prompt(msg);
        if (ans)
        {
            if (ansStyle)
            {
                if (ansStyle == 'yesno')
                {
                    ans = ans.toLowerCase();
                    if (member(ans, ['yes', 'y', 'true', 't', 1])) ans = 'true';
                    else if (member(ans, ['no', 'n', 'false', 'f', 0])) ans = 'false'
                }
                if (ansValues)
                {
                    if (member(ans, ansValues)) // Valid answer.
                    {
                        asking = false;
                    }
                }
            }
            else // No request style - accept what is given.
            {
                asking = false;
            }
            if (!asking)
            {
                var reqMode = 'generated-request';
                if (dataitem.request) reqMode = 'request';
                setDataitem(dataitem, ans, reqMode);
                appendTrail('response');
                appendTrail(dataitem);
                state = 'succeeded';
            }
        }
        else // The answer is no answer.
        {
            state = 'failed';
            asking = false;
        }
    }
    if (state == 'undetermined')
    {
trace('!!! internalRequest returned undetermined - changing to failed');
        state = 'failed'
    }
if (infProps.debugtrace)
  trace('!<internalRequest dataitem.dataname='+dataitem.dataname+' state='+state);
    return state;
}

function invokeActions()
{
    for (var a in kb.actions)
    {
        var action = kb.actions[a];
        var state = invokeAction(action);
        if (state == 'paused')
        {
            break;
        }
    }
}

function invokeAction(action)
{
//debug()
    var state = 'undetermined'; // 'undetermined', 'succeeded', 'failed' or 'paused'
    if (!action.tried)
    {
        if (action.type == "consider")
        {
            var dataname = action.attributes[0];
            trace('*action - consider "'+dataname+'"');
            state = consider(dataitems[dataname]);
            if (state != 'paused')
            {
                action.tried = true;
                appendTrail(action);
            }
        }
        else if (action.type == "output")
        {
            trace('*action - output');
            if (typeof(uiOutput) == "function")
            {
                state = uiOutput(action);
            }
            else
            {
                var msg = '';
                for (var a in action.attributes)
                {
                    var at = action.attributes[a];
                    if ((typeof(at) == "object") && (at.isa == "Valueof"))
                    {
                        var dataitem = dataitems[at.dataname];
                        if (dataitem) msg += dataitem.value;
                        else msg += '[valueof unknown "' + at.dataname + '"]';
                    }
                    else msg += at;
                }
                alert(msg);
                state = 'succeeded';
            }
            action.tried = true;
            appendTrail(action);
        }
        else if (action.type == "pause")
        {
            trace('*action - pause');
            action.tried = true; // Mark as tried so dont pause again when resume.
            appendTrail(action);
            state = 'paused';
        }
    }
    return state;
}

function resetConsultation()
{
    clearTried();
    resetTrace();
    resetTrail();
}

function beginConsultation()
{
    resetConsultation();
    invokeActions();
}

function resumeConsultation()
{
    invokeActions(); // This should continue where left off.
}

function clearTried()
{
    // Clear tried rules, actions, and dataitems.
    var i;
    for (i in kb.rules) kb.rules[i].tried = false;
    for (i in kb.actions) kb.actions[i].tried = false;
    for (i in dataitems)
    {
        dataitems[i].tried = false;
        if (dataitems[i].source != 'set')
        {
            dataitems[i].value = '';
            dataitems[i].source = '';
        }
    }
    // *Note, this does NOT clear any dataitem values that were 'set'.
    // This is so they can be set before calling beginConsultation.
}

function resetTrace()
{
    infTrace = '';
    infTraceLevel = 0;
    var main = top.frames["main"];
    if (main)
    {
        if (typeof(main.setTrace) == "function")
        {
            main.setTrace(infTrace);
        }
    }
}

function trace(str)
{
    status = str;
    if (infTrace) infTrace += '\n';
    infTrace += str;
    var main = top.frames["main"];
    if (main)
    {
        if (typeof(main.appendTrace) == "function")
        {
            main.appendTrace(str);
        }
    }
}

function traceLevel(ch)
{
    var str = '';
    for (var i = 0; i < infTraceLevel; i++) str += ch;
    return str;
}

function resetTrail()
{
    infTrail = [];
}

function appendTrail(item)
{
    infTrail[infTrail.length] = item;
}

function backTrail()
{
    var len = infTrail.length;
    for (var i = len - 1; i >= 0; i--)
    {
        var item = infTrail[i];
//alert('backTrail i='+i+' item='+item);
        infTrail.length = i;
        if (typeof(item) == 'object')
        {
            item.tried = false;
            if (item.isa == "Dataitem")
            {
                item.value = '';
                item.source = '';
            }
        }
        else if (item == 'response')
        {
            break;
        }
    }
    resumeConsultation();
}

function dumpTrail()
{
    var str;
    str = 'Trail\n';
    str += showProps(infTrail, 0);
    return str;
}
