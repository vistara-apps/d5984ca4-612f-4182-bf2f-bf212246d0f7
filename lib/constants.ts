export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

export const INTERACTION_TYPES = [
  { value: 'traffic_stop', label: 'Traffic Stop' },
  { value: 'search', label: 'Search' },
  { value: 'arrest', label: 'Arrest' },
  { value: 'other', label: 'Other' }
];

export const SAMPLE_RIGHTS_DATA = {
  california: {
    guide_id: '1',
    state_name: 'California',
    title: 'California Rights Guide',
    content: {
      dos: [
        'Remain calm and polite',
        'Keep your hands visible',
        'Ask "Am I free to leave?"',
        'Exercise your right to remain silent',
        'Ask for a lawyer if arrested'
      ],
      donts: [
        "Don't argue or resist",
        "Don't consent to searches",
        "Don't lie or provide false information",
        "Don't run or make sudden movements",
        "Don't sign anything without a lawyer"
      ],
      scripts: {
        english: [
          "I am exercising my right to remain silent.",
          "I do not consent to any searches.",
          "Am I free to leave?",
          "I want to speak to a lawyer."
        ],
        spanish: [
          "Estoy ejerciendo mi derecho a permanecer en silencio.",
          "No consiento a ninguna búsqueda.",
          "¿Soy libre de irme?",
          "Quiero hablar con un abogado."
        ]
      },
      scenarios: {
        traffic_stop: "During a traffic stop in California, you must provide your driver's license, registration, and insurance. You have the right to remain silent beyond providing these documents.",
        search: "Police need a warrant or probable cause to search you or your property. You can clearly state 'I do not consent to this search.'",
        arrest: "If arrested, you have the right to remain silent and the right to an attorney. Clearly invoke these rights."
      }
    },
    languages: ['english', 'spanish'],
    last_updated: new Date().toISOString()
  }
};
