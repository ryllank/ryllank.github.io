//============================================================================
// Project:    SimpleX
// Module:     
// File:       simplex.js
// 
// SimpleX knowledge base structure and load/print functions.
// 
// Copyright (C) Ryllan Kraft. 2002-2003.  All rights reserved.
//============================================================================

// Data structures for the knowledge base.

// Valid relations.
var relations = 
[
    ['=',  '='],
    ['!=', '!='],
    ['>',  '&gt;'],
    ['<',  '&lt;'],
    ['>=', '&gt;='],
    ['<=', '&lt;=']
];

// Knowledge base.
var kb = new KB();
function KB() //Constructor.
{
    this.isa ='KB';
    this.name = '';
    this.rules = [];        // Array of rules.
    this.requests = [];     // Array of requests.
    this.actions = [];      // Array of actions.
}

function Rule(aRulename, defaultFlag, conditionArray, conclusionArray) //Constructor
{
    this.isa ='Rule';
    this.rulename = '';     if (aRulename) this.rulename = aRulename;
    this.defaultFlag = false; if (defaultFlag) this.defaultFlag = defaultFlag;
    this.conditions = [];   if (conditionArray) this.conditions = conditionArray;
    this.conclusions = [];  if (conclusionArray) this.conclusions = conclusionArray;
    this.dependson = [];    //... set list of dataitems (when compileKB)
    this.tried = false;     //... set true when fired rule (when finished)

    this.toString = 
        function ()
        {
            return '[rule:' + this.rulename + ']'; 
        };
}
function Condition(aDataname, aNegated, aRelation, aValue) //Constructor
{
    this.isa ='Condition';
    this.dataname = '';     if (aDataname) this.dataname = aDataname;
    this.negated = false;   if (aNegated) this.negated = aNegated;
    this.relation = false;  if (aRelation) this.relation = aRelation;
    this.value = '';        if (aValue) this.value = aValue;
    this.dataitem = '';     // ... set dataitem (when compileKB)

    this.toString = 
        function ()
        {
            return '[cndn:' + this.dataname + ']'; 
        };
}
function Conclusion(aDataname, aValue) //Constructor
{
    this.isa ='Conclusion';
    this.dataname = '';     if (aDataname) this.dataname = aDataname;
    this.value = '';        if (aValue) this.value = aValue;

    this.toString = 
        function ()
        {
            return '[cncl:' + this.dataname + ']'; 
        };
}

function Request(aDataname, aPrompt, aStyle, attributesArray) //Constructor
{
    this.isa ='Request';
    this.dataname = '';     if (aDataname) this.dataname = aDataname;
    this.prompt = '';       if (aPrompt) this.prompt = aPrompt;
    this.style = false;     if (aStyle) this.style = aStyle;
    this.attributes = [];   if (attributesArray) this.attributes = attributesArray;

    this.toString = 
        function ()
        {
            return '[rqst:' + this.dataname + ']'; 
        };
}

function Action(aType, attributesArray) //Constructor
{
    this.isa ='Action';
    this.type = '';         if (aType) this.type = aType;
    this.attributes = [];   if (attributesArray) this.attributes = attributesArray;
    //this.tried    ... set true when action completed

    this.toString = 
        function ()
        {
            return '[actn:' + this.type + ']'; 
        };
}
function Valueof(aDataname) //Constructor
{
    this.isa ='Valueof';
    this.dataname = '';     if (aDataname) this.dataname = aDataname;

    this.toString = 
        function ()
        {
            return '[valf:' + this.dataname + ']'; 
        };
}

//-----------------------------------------------------------------------------

// Association table of dataitems - set up from rules and requests (not actions).
var dataitems = [];
function Dataitem(aDataname) //Constructor
{
    this.isa ='Dataitem';
    this.dataname = aDataname;
    this.rulelist = []; //... set list of rules (when compileKB) for dataitem
    //this.request  ... set (last) request (when compileKB) for dataitem
    //this.value    ... initially undefined or false (when set it should be a 
    //                  string - e.g. "0", "false")
    //this.tried    ... set true when have set value, or tried all available 
    //                  rules & requests
    //this.source   ... set true when have set value

    this.toString = 
        function ()
        {
            return '[data:' + this.dataname + ']'; 
        };
}

function getDataitem(i)
{
    var dataitem = false;
    var count = 0;
    for (var d in dataitems)
    {
        if (count == i)
        {
            dataitem = dataitems[d];
            break;
        }
        count++;
    }
//alert('><getDataitem i='+i+' dataitem='+dataitem);
    return dataitem;
}

function setDataitem(dataitem, value, source)
{
//alert('setDataitem dataitem.dataname='+dataitem.dataname+' value='+value+' source='+source);
    dataitem.value = value;
    dataitem.tried = true;
    dataitem.source = source;
}
function clearDataitem(dataitem)
{
    dataitem.tried = false;
    dataitem.value = '';
    if ((typeof(dataitem.source) == "object") && (dataitem.source.isa == "Rule"))
    {
//alert('untrying '+dataitem.source);
        dataitem.source.tried = false;
    }
    dataitem.source = '';
}

//-----------------------------------------------------------------------------

function clearKB()
{
    kb.name = '';
    kb.rules = [];
    kb.requests = [];
    kb.actions = [];
    dataitems = [];
}

// Load a KB to construct the raw data structures from a string 
// - format: 'javascript' (in future will have 'xml' and possibly 'text').
function loadKB(str, format)
{
    if (format == 'javascript')
    {
        eval(str);
    }
}

// Compile KB data structures to form dataitems association table and other 
// relationships.
function compileKB()
{
    var dataitm;
    // Get dataitems from rules.
    dataitems = [];
    for (var r in kb.rules)
    {
        var rule = kb.rules[r];
        rule.dependson = [];
        rule.tried = false;
        for (var c in rule.conditions)
        {
            var condition = rule.conditions[c];
            var dataname = condition.dataname;
            if (dataname)
            {
                dataitm = dataitems[dataname];
                if (!dataitm)
                {
                    dataitm = new Dataitem(dataname);
                    dataitems[dataname] = dataitm;
                }
//debug();
                rule.dependson[rule.dependson.length] = dataitm;
                condition.dataitem = dataitm;
            }
        }
        for (var c in rule.conclusions)
        {
            var conclusion = rule.conclusions[c];
            var dataname = conclusion.dataname;
            if (dataname)
            {
                dataitm = dataitems[dataname];
                if (!dataitm)
                {
                    dataitm = new Dataitem(dataname);
                    dataitems[dataname] = dataitm;
                }
                dataitm.rulelist[dataitm.rulelist.length] = rule;
            }
        }
    }
    // Get dataitems from requests.
    for (var i in kb.requests)
    {
        var request = kb.requests[i];
        var dataname = request.dataname;
        if (dataname)
        {
            dataitm = dataitems[dataname];
            if (!dataitm)
            {
                dataitm = new Dataitem(dataname);
                dataitems[dataname] = dataitm;
            }
            dataitm.request = request;
        }
    }
    // Ensure inference is ready to begin again.
    resetConsultation();
}

// Print KB to string.
// - format: 'text', 'javascript', 'xml'.
function printKB(format)
{
    var str = '';
    var i;
    var len;
    var nr;
    if (member(format, ['text', 'javascript', 'xml']))
    {
        if (format == 'text')
        {
            str += 'kb';
            if (kb.name) str += ' "'+ kb.name +'"';
            str += '\n\n';
        }
        if (format == 'javascript')
        {
            str += 'kb.name = "'+ kb.name +'";\n\n';
            str += 'kb.rules =\n[\n';
        }
        if (format == 'xml')
        {
            str += '<kb name="'+ kb.name +'">\n';
        }
        len = kb.rules.length;
        nr = 0;
        for (i in kb.rules)
        {
            nr++;
            str += printRule(kb.rules[i], format);
            if (format == 'javascript')
            {
                if (nr != len) str += ',';
                str += '\n';
            }
        }
        if (format == 'javascript') str += '];\n\n';
        if (format == 'javascript') str += 'kb.requests =\n[\n';
        len = kb.requests.length;
        nr = 0;
        for (i in kb.requests)
        {
            nr++;
            str += printRequest(kb.requests[i], format);
            if (format == 'javascript')
            {
                if (nr != len) str += ',';
                str += '\n';
            }
        }
        if (format == 'javascript') str += '];\n\n';
        if (format == 'javascript') str += 'kb.actions =\n[\n';
        len = kb.actions.length;
        nr = 0;
        for (i in kb.actions)
        {
            nr++;
            str += printAction(kb.actions[i], format);
            if (format == 'javascript')
            {
                if (nr != len) str += ',';
                str += '\n';
            }
        }
        if (format == 'javascript') str += '];\n\n';
        if (format == 'xml') str += '\n</kb>\n';
    }
    else
    {
        str += 'rules\n'+showProps(kb.rules);
        str += 'requests\n'+showProps(kb.requests);
        str += 'actions\n'+showProps(kb.actions);
    }
    return str;
}

function printRule(rule, format)
{
    var str = '';
    var c;
    var nr;
    var len;
    with (rule)
    {
        if (format == 'text')
        {
            if (rulename)
            {
                str += 'rule "' + rulename + '"';
                if (defaultFlag) str += ' ';
            }
            if (defaultFlag)
            {
                str += 'default';
            }
            if (rulename || defaultFlag) str += '\n';
        }
        if (format == 'javascript')
        {
            str += '  new Rule("';
            if (rulename) str += rulename;
            str += '", ';
            str += defaultFlag;
            str += ',';
        }
        if (format == 'xml')
        {
            str += '\n<rule name="';
            if (rulename) str += rulename;
            str += '"';
            if (defaultFlag) str += ' default="' + defaultFlag + '"';
            str += '>\n';
        }
        nr = 0;
        len = conditions.length;
        if (format == 'javascript')
        {
            if (len == 0)
            {
                str += ' [], ';
            }
            else
            {
                str += '\n    [\n';
            }
        }
        for (c in conditions)
        {
            var condition = conditions[c];
            nr++;
            with (condition)
            {
                if (format == 'text')
                {
                    if (nr == 1)
                    {
                        str += 'if ';
                    }
                    else
                    {
                        str += '   ';
                    }
                    if (negated) str += 'not ';
                    str += '"' + dataname + '"';
                    if (relation) str += ' ' + relation;
                    if (value) str += ' "' + value + '"';
                    if (nr != len) str += ' and';
                    str += '\n';
                }
                if (format == 'javascript')
                {
                    str += '      new Condition("' + dataname + '"';
                    if (negated) str += ', true';
                    else if (relation || value) str += ', false';
                    if (relation) str += ', "' + relation + '"';
                    else if (value) str += ', ';
                    if (value) str += ', "' + value + '"';
                    str += ')';
                    if (nr != len) str += ',\n';
                }
                if (format == 'xml')
                {
                    if (nr == 1) str += '  <condition>\n';
                    str += '    <if';
                    if (negated) str += ' not="true"';
                    str += ' data="' + dataname + '"';
                    if (relation) str += ' relation="' + relation + '"';
                    if (value) str += '>' + deentitise(value) + '</if>\n';
                    else str += ' />\n';
                    if (nr == len) str += '  </condition>\n';
                }
            }
        }
        if ((format == 'javascript') && (len > 0))
        {
            str += '\n    ], ';
        }
        nr = 0;
        len = conclusions.length;
        if (format == 'javascript')
        {
            if (len == 0)
            {
                str += '[]';
            }
            else
            {
                str += '\n    [\n';
            }
        }
        for (c in conclusions)
        {
            var conclusion = conclusions[c];
            nr++;
            with (conclusion)
            {
                if (format == 'text')
                {
                    if (conditions.length > 0)
                    {
                        if (nr == 1)
                        {
                            str += 'then ';
                        }
                        else
                        {
                            str += '     ';
                        }
                    }
                    str += '"' + dataname + '" = ';
                    if (value) str += '"' + value + '"';
                    str += '\n';
                    if (nr == len) str += '\n';
                }
                if (format == 'javascript')
                {
                    str += '      new Conclusion("' + dataname + '"';
                    if (value) str += ', "' + value + '"';
                    str += ')';
                    if (nr != len) str += ',\n';
                }
                if (format == 'xml')
                {
                    if (nr == 1) str += '  <conclusion>\n';
                    str += '    <set';
                    str += ' data="' + dataname + '"';
                    str += '>' + deentitise(value) + '</set>\n';
                    if (nr == len) str += '  </conclusion>\n';
                }
            }
        }
        if (format == 'javascript')
        {
            if (len > 0)
            {
                str += '\n    ]';
            }
            str += ')';
        }
        if (format == 'xml')
        {
            str += '</rule>\n';
        }
    }
    return str;
}

function printRequest(request, format)
{
    var str = '';
    with (request)
    {
        if (format == 'text')
        {
            str += 'ask ';
            str += '"' + dataname + '"\n';
            if (prompt) str += '    "' + prompt + '"\n';
            if (style) str += style + '\n';
            if (attributes)
            {
                for (var k in attributes)
                {
                    str += '    "' + attributes[k] + '"\n';
                }
            }
            str += '\n';
        }
        if (format == 'javascript')
        {
            str += '  new Request("' + dataname + '"';
            if (prompt) str += ', "' + prompt + '"';
            else if (style || attributes) str += ', ""';
            if (style) str += ', "' + style + '"';
            else if (attributes) str += ', false';
            if (attributes)
            {
                len = attributes.length;
                if (len > 1)
                {
                    str += ',\n    [\n';
                    for (var k in attributes)
                    {
                        str += '      "' + attributes[k] + '"';
                        if (k < len - 1) str += ',';
                        str += '\n';
                    }
                    str += '    ]';
                }
                else if (len == 1)
                {
                    str += ', [ "' + attributes[0] + '" ]';
                }
                else
                {
                    str += ', []';
                }
            }
            str += ')';
        }
        if (format == 'xml')
        {
            str += '\n<request';
            str += ' data="' + dataname + '"';
            if (style) str += ' style="' + style + '"';
            if (prompt || attributes)
            {
                str += '>';
                if (prompt) str += prompt;
                if (attributes)
                {
                    str += '\n';
                    for (var k in attributes)
                    {
                        str += '  <option>' + deentitise(attributes[k]) + '</option>\n';
                    }
                }
                str += '</request>\n';
            }
            else
            {
                str += ' />\n';
            }
        }
    }
    return str;
}

function printAction(action, format)
{
    var str = '';
    var nr;
    var len;
    with (action)
    {
        if (format == 'text')
        {
            str += type + ' ';
            if (attributes && attributes.length > 0)
            {
                nr = 0;
                for (var k in attributes)
                {
                    nr++;
                    if (nr != 1) str += '       ';
                    var at = attributes[k];
                    if ((typeof(at) == "object") && (at.isa == "Valueof"))
                    {
                        str += 'valueof "' + at.dataname + '"\n';
                    }
                    else
                    {
                        str += '"' + at + '"\n';
                    }
                }
            }
            else
            {
                str += '\n';
            }
        }
        if (format == 'javascript')
        {
            str += '  new Action("' + type + '"';
            if (attributes)
            {
                len = attributes.length;
                if (len > 1)
                {
                    str += ',\n    [\n';
                    for (var k in attributes)
                    {
                        var at = attributes[k];
                        if ((typeof(at) == "object") && (at.isa == "Valueof"))
                        {
                            str += '      new Valueof("' + at.dataname + '")';
                        }
                        else
                        {
                            str += '      "' + at + '"';
                        }
                        if (k < len - 1) str += ',';
                        str += '\n';
                    }
                    str += '    ]';
                }
                else if (len == 1)
                {
                    var at = attributes[0]
                    if ((typeof(at) == "object") && (at.isa == "Valueof"))
                    {
                        str += ', [ new Valueof("' + at.dataname + '") ]';
                    }
                    else
                    {
                        str += ', [ "' + at + '" ]';
                    }
                }
                else
                {
                    str += ', []';
                }
            }
            str += ')';
        }
        if (format == 'xml')
        {
            str += '\n<action>\n';
            str += '  <' + type;
            if (attributes && (attributes.length > 0))
            {
                var itemElmt = 'item';
                if (type == "consider")
                {
                    // Has one attribute - for a dataname.
                    str += ' data="' + attributes[0] + '" />\n';
                }
                else // e.g. an 'output'
                {
                    // Several items are elements - with a text attribute.
                    str += '>\n';
                    for (var k in attributes)
                    {
                        var at = attributes[k];
                        if ((typeof(at) == "object") && (at.isa == "Valueof"))
                        {
                            str += '    <value data="' + at.dataname + '" />\n';
                        }
                        else
                        {
                            str += '    <item text="' + deentitise(at) + '" />\n';
                        }
                    }
                    str += '  </' + type + '>\n';
                }
            }
            else 
            {
                str += ' />\n';
            }
            str += '</action>\n';
        }
    }
    return str;
}

function printDataitems()
{
    var str = '';
//str += 'dataitems\n'+showProps(dataitems);
    for (var dataname in dataitems)
    {
        var dataitem = dataitems[dataname];
        var val = dataitem.value;
        str += '"' + dataname + '" :=';
        if (val) str += ' "' + dataitem.value + '"';
        str += '\n';
//str += showProps(dataitem, -1);
//str += 'rulelist.length='+dataitem.rulelist.length+'\n';
//str += 'request='+dataitem.request+'\n';
    }
    return str;
}

function parseXML(xmlDoc)
{
    if (typeof(xmlDoc) == "object")
    {
        for (var i = 0; i < xmlDoc.childNodes.length; i++)
        {
            var node = xmlDoc.childNodes[i];
            if (node.nodeName == 'kb')
            {
                kb.name = node.getAttribute('name');
                for (var k = 0; k < node.childNodes.length; k++)
                {
                    var elm = node.childNodes[k];
                    if (elm.nodeName == 'rule')
                    {
                        parseXMLRule(elm);
                    }
                    else if (elm.nodeName == 'request')
                    {
                        parseXMLRequest(elm);
                    }
                    else if (elm.nodeName == 'action')
                    {
                        parseXMLAction(elm);
                    }
                }
            }
        }
    }
}

function parseXMLChildText(elm)
{
    var text = '';
    for (var k = 0; k < elm.childNodes.length; k++)
    {
        var chld = elm.childNodes[k];
        if (chld.nodeName == '#text')
        {
            text += trim(chld.nodeValue);
        }
    }
    return text;
}

function parseXMLRule(elm)
{
    var rulename = elm.getAttribute('name');
    var defaultFlag = false;
    var defaultValue = elm.getAttribute('default');
    if (defaultValue) defaultFlag = defaultValue;
    var conditions = [];
    var conclusions = [];
    for (var k = 0; k < elm.childNodes.length; k++)
    {
        var sub = elm.childNodes[k];
        if (sub.nodeName == 'condition')
        {
            for (var i = 0; i < sub.childNodes.length; i++)
            {
                var chld = sub.childNodes[i];
                if (chld.nodeName == 'if')
                {
                    var dataname = chld.getAttribute('data');
                    var negated = chld.getAttribute('not');
                    if (!negated) negated = false;
                    var relation = chld.getAttribute('relation');
                    if (!relation) relation = false;
                    var value = parseXMLChildText(chld);
                    conditions[conditions.length] = 
                        new Condition(dataname, negated, relation, value);
                }
            }
        }
        else if (sub.nodeName == 'conclusion')
        {
            for (var i = 0; i < sub.childNodes.length; i++)
            {
                var chld = sub.childNodes[i];
                if (chld.nodeName == 'set')
                {
                    var dataname = chld.getAttribute('data');
                    var value = parseXMLChildText(chld);
                    conclusions[conclusions.length] = 
                        new Conclusion(dataname, value);
                }
            }
        }
    }
    var n = kb.rules.length;
    kb.rules[n] = new Rule(rulename, defaultFlag, conditions, conclusions);
}

function parseXMLRequest(elm)
{
    var dataname = elm.getAttribute('data');
    if (dataname)
    {
        var prmpt = '';
        var style = elm.getAttribute('style');
        var attributes = [];
        for (var i = 0; i < elm.childNodes.length; i++)
        {
            var chld = elm.childNodes[i];
            if (chld.nodeName == 'option')
            {
                attributes[attributes.length] = parseXMLChildText(chld);
            }
            else if (chld.nodeName == '#text')
            {
                prmpt = trim(chld.nodeValue);
            }
        }
        var n = kb.requests.length;
        kb.requests[n] = new Request(dataname, prmpt, style, attributes);
    }
}

function parseXMLAction(elm)
{
    var type;
    for (var k = 0; k < elm.childNodes.length; k++)
    {
        type = false;
        var attributes = [];
        var sub = elm.childNodes[k];
        if (sub)
        {
            if (sub.nodeName == 'consider')
            {
                type = 'consider';
                attributes[0] = sub.getAttribute('data');
            }
            else if (sub.nodeName == 'output')
            {
                type = 'output';
                for (var i = 0; i < sub.childNodes.length; i++)
                {
                    var chld = sub.childNodes[i];
                    if (chld.nodeName == 'item')
                    {
                        attributes[attributes.length] = chld.getAttribute('text');
                    }
                    else if (chld.nodeName == 'value')
                    {
                        attributes[attributes.length] = 
                            new Valueof(chld.getAttribute('data'));
                    }
                }
            }
            else if (sub.nodeName == 'pause')
            {
                type = 'pause';
            }
            if (type)
            {
                var n = kb.actions.length;
                kb.actions[n] = new Action(type, attributes);
            }
        }
    }
}

function dumpDataitems()
{
    var str;
    str = 'Dataitems\n';
    str += showProps(dataitems, 1);
    return str;
}

function dumpActions()
{
    var str;
    str = 'Actions\n';
    str += showProps(kb.actions, 1);
    return str;
}

function dumpRules()
{
    var str;
    str = 'Rules\n';
    str += showProps(kb.rules, 1);
    return str;
}

function dumpRequests()
{
    var str;
    str = 'Requests\n';
    str += showProps(kb.requests, 1);
    return str;
}
