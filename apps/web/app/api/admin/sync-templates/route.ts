import { NextResponse } from 'next/server';
import { TEMPLATES } from '@/components/templates/TemplateRegistry';
import axios from 'axios';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  // 1. Extract session token from cookies to authenticate with backend
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;

  // 2. Extract all keys directly from your Next.js code
  const templateKeys = Object.keys(TEMPLATES);

  try {
    // 3. Send them to your NestJS backend with authorization
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const response = await axios.post(`${apiUrl}/admin/products/sync-templates`, {
      keys: templateKeys
    }, {
      headers: {
         Authorization: `Bearer ${token}`
      }
    });
    
    return NextResponse.json({ success: true, synced: templateKeys, data: response.data });
  } catch (error: any) {
    console.error('Template sync error:', error.response?.data || error.message);
    return NextResponse.json({ 
        error: "Failed to sync", 
        details: error.response?.data || error.message 
    }, { status: 500 });
  }
}
