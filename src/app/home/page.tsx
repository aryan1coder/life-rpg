import { redirect } from 'next/navigation';

/**
 * /home route cleanly forwards to the primary /lobby authenticated home.
 */
export default function HomePage() {
  redirect('/lobby');
}
