MRShared = {};

/*MRShared.Commands.Permission = {
    'tp': 'admin',
    'tpc': 'admin',
    'setgroup': 'root',
    'removegroup': 'root',
    'car': 'admin',
    'dv': 'admin',
    'tpm': 'root'
}*/

MRShared.Jobs = {
    "unemployed": {
        label: "Unemployed",
        defaultPayment: 30,
        defaultDuty: false,
    },
    "police": {
        label: "Police",
        defaultPayment: 100,
        defaultDuty: false,
        grades: {
            'cadet': {
                name: "Cadet",
                payment: 1000
            },
            'officer_1': {
                name: "Officer 1",
                payment: 1400
            },
            'officer_2': {
                name: "Officer 2",
                payment: 1700
            },
            'senior_officer': {
                name: "Senior Officer",
                payment: 2400
            },
            'sergeant_3': {
                name: "Sergeant 3",
                payment: 3000
            },
            'sergeant_2': {
                name: "Sergeant 2",
                payment: 3200
            },
            'sergeant_1': {
                name: "Sergeant 1",
                payment: 3400
            },
            'senior_sergeant': {
                name: "Senior Sergeant",
                payment: 3600
            },
            'lieutenant': {
                name: "Lieutenant",
                payment: 3800
            },
            'assistant_chief': {
                name: "Assistant Chief",
                isboss: true,
                payment: 4200
            },
            'chief': {
                name: "Chief",
                isboss: true,
                payment: 4500
            },
        },
    },
}