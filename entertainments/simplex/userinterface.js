//============================================================================
// Project:    SimpleX
// Module:     
// File:       userinterface.js
// 
// SimpleX user interface functions - used when running a SimpleX knowledge 
// base, performing a consultation.
// 
// Copyright (C) Ryllan Kraft. 2002.  All rights reserved.
//============================================================================

var askOptions = 'radio';      // or 'select'
function uiSetAskOptions(askOption)
{
    askOptions = askOption;
}

function uiOutput(action)
{
    var state = 'undetermined';
    var str = '';
    str += '<h1>Output</h1>\n';
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
    str += '\n<p>' + msg + '</p>\n';
//alert('action='+action
//+' kb.actions[kb.actions.length - 1]='+kb.actions[kb.actions.length - 1]
//+' last='+(action == kb.actions[kb.actions.length - 1]));
    str += '<form>\n';
    if (action != kb.actions[kb.actions.length - 1])
    {
        str += '<input type="button" value="Continue"';
        str += ' onclick="resumeConsult()">\n';
    }
    if (infTrail.length > 0)
    {
        str += '<input type="button" value="Back"';
        str += ' onclick="backTrack()">\n';
    }
    str += '</form>\n';
    var main = top.frames["main"];
    if (main && main.setUIZone)
    {
        main.setUIZone(str);
        state = 'paused'; // Always pause after displaying this output.
    }
    return state;
}

function uiRequest(dataitem)
{
    var state = 'undetermined';
    var str = '';
    var dname = dataitem.dataname;
    var header = 'Request "' + dname + '"';
    str += '<h1>' + header + '</h1>\n';
    var ansStyle;
    var prompt;
    var ansValues;
    var input;
    var inputName;
    if (dataitem.request)
    {
        prompt = dataitem.request.prompt;
        ansStyle = dataitem.request.style;
        if (ansStyle == 'yesno')
        {
            if (askOptions == 'select')
            {
                inputName = 'selYesNo';
                input = '<select name="'+inputName+'">';
                input += '<option value="">';
                input += '<option value="true">Yes';
                input += '<option value="false">No</select>\n';
            }
            else if (askOptions == 'radio')
            {
                inputName = 'radYesNo';
                input = '<input type="radio" name="'+inputName+'" value="true">Yes<br>\n';
                input += '<input type="radio" name="'+inputName+'" value="false">No<br>\n';
            }
        }
        else if (ansStyle == 'oneof')
        {
            ansValues = dataitem.request.attributes;
            if (askOptions == 'select')
            {
                inputName = 'selOneOf';
                input = '<select name="'+inputName+'">';
                input += '<option>';
                for (var a in ansValues)
                {
                    input += '<option>' + ansValues[a];
                }
                input += '</select>\n';
            }
            else if (askOptions == 'radio')
            {
                inputName = 'radOneOf';
                input = '';
                for (a in ansValues)
                {
                    input += '<input type="radio" name="'+inputName+'"';
                    input += ' value="' + ansValues[a] + '">' + ansValues[a];
                    input += '<br>\n';
                }
            }
        }
    }
    if (!prompt)
    {
        prompt = 'Give a value for "' + dataitem.dataname + '"';
    }
    str += '<p>' + prompt + '</p>\n';
    var dnameq = escquote(dname);
    if (!input)
    {
        inputName = 'txtValue';
        input = '<input type="text" name="'+inputName+'" value=""';
        input += ' onkeypress="enterResponseOnReturn(\''+dnameq+'\', \''+inputName+'\', this)">';
    }
    str += '<form name="frmReq">\n';
    str += input;
    str += '<br><input type="button" value="Enter"';
    str += ' onclick="enterResponse(\''+dnameq+'\', \''+inputName+'\', this)">\n';
    str += '<input type="button" value="No Response"';
    str += ' onclick="noResponse(\''+dnameq+'\')">\n';
    if (infTrail.length > 0)
    {
        str += '<input type="button" value="Back"';
        str += ' onclick="backTrack()">\n';
    }
    str += '</form>\n';
//alert(str);
    var main = top.frames["main"];
    if (main && main.setUIZone)
    {
        main.setUIZone(str);
        if (inputName == 'txtValue')
        {
            var doc = main.document;
            if (typeof(document.layers) != "undefined")
            {
                var uiZone = doc.layers["layUIZone"];
//alert('uiZone='+uiZone);
                if (uiZone)
                {
                    doc = uiZone.document;
                }
            }
            if (doc)
            {
//alert('doc='+doc);
                var form = doc.forms["frmReq"];
                if (form)
                {
//alert('form='+form);
                    var inp = form.elements[inputName];
                    if (inp)
                    {
//alert('inp='+inp);
                        inp.focus();
                    }
                }
            }
        }
        state = 'paused'; // Always pause after invoking this request.
    }
//alert(state);
    return state;
}

function uiResponse(dname, inputName, input)
{
    var result = false;
    var dataitem = dataitems[dname];
//alert('uiResponse dname="'+dname+'" dataitem='+dataitem+' inputName='+inputName+' input='+input);
    var val;
    var form = input.form;
    if (form)
    {
//alert('form='+form);
        var input = form.elements[inputName];
        if (input)
        {
            if (inputName == 'selYesNo')
            {
                val = input.options[input.selectedIndex].value;
            }
            else if (inputName == 'radYesNo')
            {
                val = top.getRadioValue(input);
            }
            else if (inputName == 'selOneOf')
            {
                val = input.options[input.selectedIndex].text;
            }
            else if (inputName == 'radOneOf')
            {
                val = top.getRadioValue(input);
            }
            else
            {
                val = input.value;
            }
//alert('val='+val)
            if (val)
            {
                var reqMode = 'generated-request';
                if (dataitem.request) reqMode = 'request';
                setDataitem(dataitem, val, reqMode);
                appendTrail('response');
                appendTrail(dataitem);
                var main = top.frames["main"];
//alert(main.resumeConsult);
                if (main && main.resumeConsult)
                {
                    main.resumeConsult();
                }
                else
                {
                    resumeConsultation();
                }
            }
            else
            {
                alert('Please specify a response');
            }
        }
    }
}

function uiResponseOnReturn(dname, inputName, textEntry)
{
    var main = top.frames["main"];
    if (main)
    {
        if (typeof(main.event) == "object") // i.e. IE.
        {
            if (main.event.keyCode == 13) //Return/Enter
            {
                uiResponse(dname, inputName, textEntry);
                main.event.returnValue = false;
            }
        }
    }
}

function uiNoResponse(dname)
{
    var dataitem = dataitems[dname];
    var reqMode = 'generated-request';
    if (dataitem.request) reqMode = 'request';
    setDataitem(dataitem, '', reqMode); // Tried, but no value.
    appendTrail('response');
    appendTrail(dataitem);
    var main = top.frames["main"];
    if (main && main.resumeConsult)
    {
        main.resumeConsult();
    }
    else
    {
        resumeConsultation();
    }
}
