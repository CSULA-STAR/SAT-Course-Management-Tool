'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/table';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Strong } from '@/components/text';

interface Course {
  course_code: string | string[];
  course_name: string;
  course_credits: number;
}

interface Mapping {
  csula_course: Course[];
  external_course: Course;
}

interface Row {
  csula_course_code: string;
  csula_course_name: string;
  csula_credits: number;
  ext_course_code: string;
  ext_course_name: string;
  ext_credits: number;
  id: string;
}

// Example API response data
const reply_json = [
  {
    "course_code": "ACCT 2100",
    "course_name": "Principles of Financial Accounting",
    "credits": 3,
    "equivalent_to": [
      "ACCT 001A"
    ],
    "equivalent_to_course_name": [
      "Financial Accounting"
    ],
    "equivalent_to_credits": [
      4
    ]
  },
  {
    "course_code": "CIS 1200",
    "course_name": "Information and Technology Literacy",
    "credits": 3,
    "equivalent_to": [
      "BIT 025",
      "CIS 010"
    ],
    "equivalent_to_course_name": [
      "Survey of Computer Technology in Business",
      "Introduction to Information Systems"
    ],
    "equivalent_to_credits": [
      3,
      3
    ]
  },
  {
    "course_code": "CIS 2830",
    "course_name": "Introduction to Application Programming",
    "credits": 3,
    "equivalent_to": [
      "CIS 016"
    ],
    "equivalent_to_course_name": [
      "Java Programming"
    ],
    "equivalent_to_credits": [
      3
    ]
  },
  {
    "course_code": "ECON 2010",
    "course_name": "Principles of Economics I Microeconomics",
    "credits": 3,
    "equivalent_to": [
      "ECON 001B",
      "ECON 001BH"
    ],
    "equivalent_to_course_name": [
      "Principles of Microeconomics",
      "Honors Principles of Microeconomics"
    ],
    "equivalent_to_credits": [
      3,
      3
    ]
  }
];

const Map = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentName, setDepartmentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const s_id = searchParams.get('s_id');
  const dept = searchParams.get('dept');
  
  useEffect(() => {
    const navbar = document.querySelector('.header') as HTMLElement | null;
    if (navbar) navbar.style.display = 'none';

    const mainElement = document.querySelector('main') as HTMLElement | null;
    if (mainElement) {
      mainElement.classList.remove('main-content');
    }

    return () => {
      if (navbar) navbar.style.display = '';
      if (mainElement) {
        mainElement.classList.add('main-content');
      }
    };
  }, []);

  useEffect(() => {
    if (!s_id || !dept) {
      router.push('/autoimport'); // fallback in case of missing params
      return;
    }

    const fetchMappingData = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call when ready
        // const response = await fetch(`http://localhost:3001/api/autoimport?s_id=${s_id}&dept=${dept}`);
        // const data = await response.json();
        
        // Using example data(reply_json) for now
        const data = {
          mappings: reply_json.map(item => ({
            external_course: {
              course_code: item.course_code,
              course_name: item.course_name,
              course_credits: item.credits
            },
            csula_course: item.equivalent_to.map((code, index) => ({
              course_code: code,
              course_name: item.equivalent_to_course_name[index],
              course_credits: item.equivalent_to_credits[index]
            }))
          })),
          department_name: 'Computer Information Systems',
          school_name: 'Transfer School'
        };

        const mappings: Mapping[] = data.mappings || [];

        setDepartmentName(data.department_name || 'Courses Mapping');
        setSchoolName(data.school_name || 'Transfer School');

        const flatRows: Row[] = [];

        mappings.forEach((mapping, idx) => {
          const ext = mapping.external_course;
          const extCodes = Array.isArray(ext.course_code) ? ext.course_code.join(', ') : ext.course_code;

          if (extCodes === 'READY 0001') return;

          mapping.csula_course.forEach((csula, i) => {
            const csulaCodes = Array.isArray(csula.course_code) ? csula.course_code.join(', ') : csula.course_code;
            flatRows.push({
              csula_course_code: csulaCodes,
              csula_course_name: csula.course_name,
              csula_credits: csula.course_credits,
              ext_course_code: extCodes,
              ext_course_name: ext.course_name,
              ext_credits: ext.course_credits,
              id: `${extCodes}-${csulaCodes}-${idx}-${i}`,
            });
          });
        });

        setRows(flatRows.sort((a, b) => a.csula_course_code.localeCompare(b.csula_course_code)));
        setError(flatRows.length ? null : 'No mapping course available');
      } catch (err) {
        console.error(err);
        setError('Failed to fetch mapping data');
      } finally {
        setLoading(false);
      }
    };

    fetchMappingData();
  }, [s_id, dept, router]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const selectAll = () => {
    const allIds = new Set(rows.map(row => row.id));
    setSelectedIds(allIds);
  };

  const unselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleImportSelected = async () => {
    // Format selected courses into JSON payload
    const selectedRows = rows.filter(row => selectedIds.has(row.id));
    const payload = JSON.stringify({
      school_id: s_id,
      dept: dept,
      mapping: selectedRows.map(row => ({
        external_course: {
          course_code: row.ext_course_code,
          course_name: row.ext_course_name,
          credits: row.ext_credits
        },
        csula_course: {
          course_code: row.csula_course_code,
          course_name: row.csula_course_name,
          credits: row.csula_credits
        }
      }))
    })

    // TODO: Implement import functionality
    // Send POST request using fetch to /api/autoimport/courses endpoint
    // Handle success/error responses
    // Show confirmation to user

    // Using console.log for now
    console.log(payload);

  };

  const handleRowClick = (id: string) => {
    toggleSelect(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Strong className="text-red-600 dark:text-red-400">{error}</Strong>
      </div>
    );
  }

  return (
    <div className="mt-0 p-6 relative">
      {/* Action buttons */}
      <div className="flex gap-4 mb-6">
        <Button onClick={selectAll} color="zinc">
          Select All
        </Button>
        <Button onClick={unselectAll} outline>
          Unselect All
        </Button>
        <div className="ml-auto">
          <Button 
            onClick={handleImportSelected} 
            color="blue"
            disabled={selectedIds.size === 0}
          >
            Import Selected Courses ({selectedIds.size})
          </Button>
        </div>
      </div>

      <Table className="mt-6">
        {/* Department Header Row */}
        <TableHead>
          <TableRow className="bg-gray-50 border-b-2 border-gray-200">
            <TableHeader className="text-center py-3 px-4 text-xl font-bold text-gray-700" colSpan={4}>
              {departmentName}
            </TableHeader>
          </TableRow>
        </TableHead>
        
        {/* Column Headers Row */}
        <TableHead>
          <TableRow className="bg-white">
            <TableHeader className="text-black w-[60px] text-center p-2">
              <div className="flex justify-center items-center scale-130 m-2">
                <Checkbox 
                  checked={selectedIds.size === rows.length && rows.length > 0}
                  onChange={() => selectedIds.size === rows.length ? unselectAll() : selectAll()}
                />
              </div>
            </TableHeader>
            <TableHeader className="text-center text-black text-lg">
              {`From: ${schoolName}`}
            </TableHeader>
            <TableHeader className="text-center w-[10%] text-5xl text-purple-900">
              <span>&#8594;</span>
            </TableHeader>
            <TableHeader className="text-center text-black text-lg">
              To: CalState LA
            </TableHeader>
          </TableRow>
        </TableHead>

        {/* Course Mapping Table Body */}
        <TableBody>
          {rows.map((row) => (
            <TableRow 
              key={row.id} 
              className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-2 hover:border-gray-500"
              onClick={() => handleRowClick(row.id)}
            >
              <TableCell className="w-[60px] text-center p-2">
                <div onClick={(e) => e.stopPropagation()} className="flex justify-center items-center scale-130 m-2">
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                  />
                </div>
              </TableCell>
              <TableCell className="bg-blue-50 w-[35%]">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-purple-700 text-lg mb-1">{row.ext_course_code}</div>
                    <div className="text-gray-700 text-base mb-1">{row.ext_course_name}</div>
                  </div>
                  <span className="bg-gray-200 text-gray-800 font-bold rounded-lg px-3 py-1 text-base min-w-12 text-center inline-block">
                    {row.ext_credits.toFixed(2)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center w-[10%] text-5xl text-purple-900">&#8594;</TableCell>
              <TableCell className="bg-yellow-50 w-[35%]">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="font-bold text-purple-700 text-lg mb-1">{row.csula_course_code}</div>
                    <div className="text-gray-700 text-base mb-1">{row.csula_course_name}</div>
                  </div>
                  <span className="bg-gray-200 text-gray-800 font-bold rounded-lg px-3 py-1 text-base min-w-12 text-center inline-block">
                    {row.csula_credits.toFixed(2)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Map;