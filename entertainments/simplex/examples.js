//============================================================================
// Project:    SimpleX
// Module:     
// File:       examples.js
// 
// SimpleX example knowledge bases.
// 
// Copyright (C) Ryllan Kraft. 2002-2003.  All rights reserved.
//============================================================================

var examples = [
 [ 'Clear KB', top.clearKB],
 [ 'Simple Life', loadSimpleExample ],
 [ 'Car Trouble', loadCarExample ]
];

function selectExamples()
{
    var str = '';
    str += '<select onchange="top.loadExample(this)">\n';
    for (var e in examples)
    {
        var example = examples[e];
        str += '<option value="'+ e + '"';
        if (e == 0) str += ' selected';
        str += '>' + example[0] + '\n';
    }
    str += '</select>\n';
    return str;
}

function loadExample(seln)
{
    var s = seln.selectedIndex;
    var e = seln.options[s].value;
    var loadFn = examples[e][1];
    loadFn();
    top.compileKB();
    var main = top.frames["main"];
    if (main)
    {
        main.location = 'showkb.htm';
    }
}

function loadSimpleExample()
{
    kb.name = "Simple Life";

    kb.rules =
    [
      new Rule("Really sick", false,
        [
          new Condition("You're feeling OK", true)
        ], 
        [
          new Conclusion("Your life", "sick"),
          new Conclusion("Life the Universe and Everything", "- aagh")
        ]),
      new Rule("Worries", false,
        [
          new Condition("Your problem", false, "=", 
            "I've a pain in all the diodes in my left side")
        ], 
        [
          new Conclusion("Your life", "a mess"),
          new Conclusion("Life the Universe and Everything", "- don't both me now")
        ]),
      new Rule("Life, don't talk to me about life", false,
        [
          new Condition("You're feeling OK"),
          new Condition("Your problem", true, "!=", "Nothing")
        ], 
        [
          new Conclusion("Your life", "a bed of roses"),
          new Conclusion("Life the Universe and Everything", "42")
        ]),
      new Rule("That's the question", false,
        [
          new Condition("Your problem", false, "=", 
            "Why, what do you think's the matter?"),
          new Condition("Questioning", false, "!=", "-")
        ], 
        [
          new Conclusion("Your life", "a mystery"),
          new Conclusion("Life the Universe and Everything", "?")
        ])
    ];

    kb.requests =
    [
      new Request("You're feeling OK", "Are you feeling OK?", "yesno", []),
      new Request("Your problem", "What's your problem?", "oneof",
        [
          "I've a pain in all the diodes in my left side",
          "Nothing",
          "Why, what do you think's the matter?"
        ]),
      new Request("Questioning", 
        "I'll ask the questions - do you always answer a question with a question?", 
        "oneof",
        [
          "No",
          "What do you think?"
        ])
    ];

    kb.actions =
    [
      new Action("consider", [ "Your life" ]),
      new Action("output",
        [
          "Your life is just ",
          new Valueof("Your life"),
          "<br>The answer to the ultimate question is ",
          new Valueof("Life the Universe and Everything")
        ])
    ];
}

function loadCarExample()
{
    kb.name = "Car Trouble";

    kb.rules =
    [
      new Rule("electrics problem advice", false,
        [
          new Condition("electrics problem")
        ], 
        [
          new Conclusion("advice", "There is a problem with the electrics.<br>"+
            "The battery is probably flat.<br>"+
            "Try recharging it.")
        ]),
      new Rule("no fuel advice", false,
        [
          new Condition("no fuel")
        ], 
        [
          new Conclusion("advice", "You have no fuel in the tank.<br>"+
            "You need to go and get some.")
        ]),
      new Rule("engine trouble advice", false,
        [
          new Condition("engine trouble")
        ], 
        [
          new Conclusion("advice", "You've got engine trouble.<br>"+
            "It might just be flooding, so try again in a while.<br>"+
            "If it still won't work you'd better get it seen to.")
        ]),
      new Rule("can't find problem advice", true, [], 
        [
          new Conclusion("advice", "I cannot find the fault.<br>"+
            "You had better consult a real car mechanic.")
        ]),
      new Rule("electrics problem - headlights test", false,
        [
          new Condition("test headlights", false, "=", 
            "the headlights don't light")
        ], 
        [
          new Conclusion("electrics problem", "true")
        ]),
      new Rule("electrics problem - start test", false,
        [
          new Condition("test starting motor", false, "=", 
            "starter motor doesn't start at all")
        ], 
        [
          new Conclusion("electrics problem", "true")
        ]),
      new Rule("engine trouble", false,
        [
          new Condition("test starting motor", false, "=", 
            "starter motor works, but engine won't start"),
          new Condition("no fuel", true)
        ], 
        [
          new Conclusion("engine trouble", "true")
        ])
    ];

    kb.requests =
    [
      new Request("test headlights", 
        "What happens when you switch on the headlights", "oneof",
        [
          "the headlights light OK",
          "the headlights don't light"
        ]),
      new Request("test starting motor", 
        "What happens when you try starting the engine", "oneof",
        [
          "the engine starts OK",
          "starter motor works, but engine won't start",
          "starter motor doesn't start at all"
        ]),
      new Request("no fuel", "Does the fuel gauge show empty", "yesno", [])
    ];

    kb.actions =
    [
      new Action("output", [ "<big>Car Trouble</big><br><br>"+
        "This example asks you questions to try to diagnose a fault with a car." ]),
      new Action("consider", [ "advice" ]),
      new Action("output", [ new Valueof("advice") ])
    ];
}
