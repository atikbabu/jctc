import { getSession } from 'next-auth/react';

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: { destination: '/dashboard', permanent: false },
    };
  }

  return {
    redirect: { destination: '/dashboard', permanent: false },
  };
}

export default function Home() {
  return null;
}
