const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, email, subject, message, discord } = JSON.parse(event.body);
    
    // Get webhook URL from environment variable
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('DISCORD_WEBHOOK_URL environment variable is not set');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }
    
    const discordMessage = {
      username: 'Website Contact Form',
      embeds: [{
        title: 'New Contact Form Submission',
        color: 0x00ff00,
        fields: [
          {
            name: 'Name',
            value: name,
            inline: true
          },
          {
            name: 'Email',
            value: email,
            inline: true
          },
          {
            name: 'Discord',
            value: discord || 'Not provided',
            inline: true
          },
          {
            name: 'Subject',
            value: subject,
            inline: true
          },
          {
            name: 'Message',
            value: message,
            inline: false
          }
        ],
        timestamp: new Date().toISOString()
      }]
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordMessage),
    });

    if (!response.ok) {
      throw new Error('Failed to send message to Discord');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Message sent successfully' }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send message' }),
    };
  }
};
