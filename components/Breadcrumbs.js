
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const Breadcrumbs = () => {
  const router = useRouter();
  const pathSegments = router.pathname.split('/').filter(segment => segment);

  // Capitalize the first letter of a string
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link href="/dashboard" className="inline-flex items-center text-gray-700 hover:text-blue-600">
            Home
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;

          // Replace bracketed dynamic routes with a more readable format
          const title = capitalize(segment.replace('[', '').replace(']', ''));

          return (
            <li key={href}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <Link href={href} className={`ml-1 ${isLast ? 'text-gray-800 font-semibold' : 'text-gray-700 hover:text-blue-600'} md:ml-2`}>
                    {title}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
