'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import styles from './Map.module.css';

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

const Map = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentName, setDepartmentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

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
      router.push('/autoimport');
      return;
    }

    const fetchMappingData = async () => {
      setLoading(true);
      try {
        const response = {
          data: {
            school_name: 'Fake Transfer School',
            department_name: 'Computer Science',
            mappings: [
              {
                external_course: {
                  course_code: 'MATH 101',
                  course_name: 'College Algebra',
                  course_credits: 3,
                },
                csula_course: [
                  {
                    course_code: 'MATH 1000A',
                    course_name: 'Intro Algebra',
                    course_credits: 3,
                  },
                ],
              },
              {
                external_course: {
                  course_code: 'ENG 102',
                  course_name: 'Composition',
                  course_credits: 3,
                },
                csula_course: [
                  {
                    course_code: 'ENGL 1010',
                    course_name: 'College Writing',
                    course_credits: 3,
                  },
                ],
              },
            ],
          },
        };

        const mappings: Mapping[] = response.data.mappings || [];
        setDepartmentName(response.data.department_name || 'Courses Mapping');
        setSchoolName(response.data.school_name || 'Transfer School');

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
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  const handlePrint = () => window.print();

  const handleImport = () => {
    if (selectedIds.size === 0) {
      setDialogMessage('Please select at least one course to import.');
      setShowDialog(true);
      return;
    }

    // Show success dialog
    setDialogMessage('Selected courses imported successfully!');
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    setDialogMessage('');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className={styles['map-content']} sx={{ p: 3, position: 'relative' }}>
      <IconButton aria-label="print" onClick={handlePrint} sx={{ position: 'absolute', top: 16, right: 16 }}>
        <PrintIcon fontSize="large" />
      </IconButton>

      <Typography variant="h4" gutterBottom>{departmentName}</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow className={styles['MuiTableRow-head']}>
              <TableCell padding="checkbox">
                <Checkbox disabled />
              </TableCell>
              <TableCell align="center" className={styles['MuiTableCell-head']}>
                {`From: ${schoolName}`}
              </TableCell>
              <TableCell align="center" className={styles['arrow-cell']}><span style={{ color: '#FFF' }}>&#8594;</span></TableCell>
              <TableCell align="center" className={styles['MuiTableCell-head']}>To: CalState LA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className={styles['MuiTableRow-root']}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleSelect(row.id)}
                    inputProps={{ 'aria-label': 'select mapping' }}
                  />
                </TableCell>
                <TableCell align="left" className={styles['transferschool-cell']}>
                  <div className={styles['course-block']}>
                    <div className={styles['course-info']}>
                      <div className={styles['course-code']}>{row.ext_course_code}</div>
                      <div className={styles['course-name']}>{row.ext_course_name}</div>
                    </div>
                    <span className={styles['credits-pill']}>{row.ext_credits.toFixed(2)}</span>
                  </div>
                </TableCell>
                <TableCell align="center" className={styles['arrow-cell']}>&#8594;</TableCell>
                <TableCell align="left" className={styles['calstatela-cell']}>
                  <div className={styles['course-block']}>
                    <div className={styles['course-info']}>
                      <div className={styles['course-code']}>{row.csula_course_code}</div>
                      <div className={styles['course-name']}>{row.csula_course_name}</div>
                    </div>
                    <span className={styles['credits-pill']}>{row.csula_credits.toFixed(2)}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={3} textAlign="right">
        <Button
          variant="contained"
          color="primary"
          onClick={handleImport}
          disabled={selectedIds.size === 0}
        >
          Import Selected
        </Button>
      </Box>

      <Dialog open={showDialog} onClose={handleDialogClose}>
        <DialogTitle></DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Map;
