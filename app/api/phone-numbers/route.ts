import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.retellai.com/list-phone-numbers', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener números de teléfono de Retell AI');
    }

    const phoneNumbers = await response.json();
    return NextResponse.json(phoneNumbers);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching phone numbers:', error);
    return NextResponse.json({ error: 'Error al obtener números de teléfono' }, { status: 500 });
  }
}
