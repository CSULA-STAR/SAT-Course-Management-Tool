'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/table';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Strong } from '@/components/text';
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";

const autoimportApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/autoimport`;
const coursesImportApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/autoimport/courses`;

interface MappingItem {
  csula_course_code: string;
  csula_course_name: string;
  csula_credits: number;
  equivalent_to: string[];
  equivalent_to_course_name: string[];
  equivalent_to_credits: number[];
}

interface ApiResponse {
  school_id: string;
  school_name: string;
  department_id: string;
  department_name: string;
  mappings: MappingItem[];
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

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentName, setDepartmentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string>('');
  const hasFetchedRef = useRef(false);

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

    // Prevent multiple API calls
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const fetchMappingData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${autoimportApiUrl}?s_id=${s_id}&dept=${dept}`);

        // Handle error case
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch mapping data');
        }
        const data: ApiResponse = await response.json();
        const mappings: MappingItem[] = data.mappings || [];

        setDepartmentName(data.department_name || 'Courses Mapping');
        setSchoolName(data.school_name || 'Transfer School');

        const flatRows: Row[] = [];

        mappings.forEach((item: MappingItem, idx: number) => {
          const csulaCourseCode = item.csula_course_code;
          const csulaCourseName = item.csula_course_name;
          const csulaCredits = item.csula_credits;

          // Skip if no equivalent courses
          if (!item.equivalent_to || item.equivalent_to.length === 0) {
            return;
          }

          item.equivalent_to.forEach((extCode: string, i: number) => {
            const extCourseName = item.equivalent_to_course_name[i] || '';
            const extCredits = item.equivalent_to_credits[i] || 0;
            
            flatRows.push({
              csula_course_code: csulaCourseCode,
              csula_course_name: csulaCourseName,
              csula_credits: csulaCredits,
              ext_course_code: extCode,
              ext_course_name: extCourseName,
              ext_credits: extCredits,
              id: `${csulaCourseCode}-${extCode}-${idx}-${i}`,
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
  }, [s_id, dept]);

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
      department_name: departmentName,
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
    });

    try {
      const response = await fetch(coursesImportApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.error || 'Failed to import courses';
        setImportError(errorMessage);
        setShowErrorDialog(true);

      } else {
        const successMessage = responseData.message || 'Courses imported successfully';
        setImportSuccessMessage(successMessage);
        setShowSuccessDialog(true);
        
        // Reset selection
        // setSelectedIds(new Set());
      }

    } catch (error) {
      console.error('Error importing courses:', error);
      setImportError('Network error occurred while importing courses');
      setShowErrorDialog(true);
    }
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
      <div className="flex flex-col justify-center items-center min-h-[80vh] gap-4">
        <Strong className="text-red-600 dark:text-red-400 text-center">{error}</Strong>
        <Button 
          onClick={() => router.push('/autoimport')} 
          color="blue"
          className="mt-4"
        >
          Back to Previous Page
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="mt-0 p-6 relative max-w-7xl mx-auto">
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

      {/* Horizontal scroll instruction */}
      <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
        💡 Tip: The mapping table is horizontally scrollable if you can&apos;t see all columns
      </div>

      <Table className="mt-6 w-full border border-gray-300">
        {/* Department Header Row */}
        <TableHead>
          <TableRow className="bg-gray-50">
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
            <TableHeader className="text-center w-[8%] text-5xl text-purple-900">
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
              <TableCell className="bg-blue-50 w-[42%]">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-purple-700 text-lg mb-1 break-words">{row.ext_course_code}</div>
                    <div className="text-gray-700 text-base mb-1 break-words leading-relaxed">{row.ext_course_name}</div>
                  </div>
                  <span className="bg-gray-200 text-gray-800 font-bold rounded-lg px-3 py-1 text-base min-w-12 text-center inline-block flex-shrink-0">
                    {row.ext_credits.toFixed(2)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center w-[8%] text-5xl text-purple-900">&#8594;</TableCell>
              <TableCell className="bg-yellow-50 w-[42%]">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-purple-700 text-lg mb-1 break-words">{row.csula_course_code}</div>
                    <div className="text-gray-700 text-base mb-1 break-words leading-relaxed">{row.csula_course_name}</div>
                  </div>
                  <span className="bg-gray-200 text-gray-800 font-bold rounded-lg px-3 py-1 text-base min-w-12 text-center inline-block flex-shrink-0">
                    {row.csula_credits.toFixed(2)}
                  </span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    
    {/* Error Dialog */}
    <Dialog open={showErrorDialog} onClose={setShowErrorDialog}>
        <DialogTitle>Import Error</DialogTitle>
        <DialogDescription>{importError}</DialogDescription>
        <DialogActions>
        <Button
            onClick={() => {
            setShowErrorDialog(false);
            setImportError(null);
            }}
        >
            Confirm
        </Button>
        </DialogActions>
    </Dialog>
    
    {/* Success Dialog */}
    <Dialog open={showSuccessDialog} onClose={setShowSuccessDialog}>
        <DialogTitle>Import Successful</DialogTitle>
        <DialogDescription>{importSuccessMessage}</DialogDescription>
        <DialogActions>
        <Button onClick={() => {
          setShowSuccessDialog(false);
        }}>Confirm</Button>
        </DialogActions>
    </Dialog>
    </>
  );
}