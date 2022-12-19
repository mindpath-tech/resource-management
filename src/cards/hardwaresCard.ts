export const hardwaresCard = {
  $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  type: 'AdaptiveCard',
  version: '1.0',
  body: [
    {
      type: 'TextBlock',
      text: 'Please select Hardwares from below',
    },
    {
      type: 'Input.ChoiceSet',
      id: 'Hardwares',
      isMultiSelect: true,
      value: '1,3',
      style: 'compact',
      choices: [
        {
          title: 'Monitor',
          value: 'Monitor',
        },
        {
          title: 'Mouse and Keyboard',
          value: 'Mouse and Keyboard',
        },
        {
          title: 'Headphone',
          value: 'Headphone',
        },
        {
          title: 'Dock',
          value: 'Dock',
        },
        {
          title: 'Laptop',
          value: 'Laptop',
        },
      ],
    },
  ],
  actions: [
    {
      type: 'Action.Submit',
      title: 'Submit',
    },
  ],
};
