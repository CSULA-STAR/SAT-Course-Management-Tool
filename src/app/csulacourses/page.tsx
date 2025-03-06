"use client";

import { useState, useEffect } from "react";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/csula-courses`;

interface Department {
    id: string;
    name: string;
}

interface Course {
    _id: string;
    course_code: string[];
    course_name: string;
    credits: number;
    department: Department[];
    co_requisite: { course_code: string[]; description: string };
    pre_requisite: { course_code: string[]; description: string };
    course_type: string;
    isPreAndCoreqAreSame: boolean;
    term: string[];
}

function TableComponent({
    courses,
    onDelete,
}: {
    courses: Course[];
    onDelete: (id: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

    const openDeleteDialog = (id: string) => {
        setSelectedCourseId(id);
        setIsOpen(true);
    };

    return (
        <>
        <Table grid striped className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
                <TableRow>
                    <TableHeader>Course Name</TableHeader>
                    <TableHeader>Course Code</TableHeader>
                    <TableHeader>Credits</TableHeader>
                    <TableHeader>Department</TableHeader>
                    <TableHeader>Prerequisites</TableHeader>
                    <TableHeader>Co-requisites</TableHeader>
                    <TableHeader>Course Type</TableHeader>
                    <TableHeader>Terms Offered</TableHeader>
                    <TableHeader></TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {courses.map((course) => (
                    <TableRow key={course._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{course.course_name}</TableCell>
                        <TableCell>{course.course_code.join(", ")}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>{course.department.map(dep => dep.name).join(", ")}</TableCell>
                        <TableCell>{course.pre_requisite.course_code.join(", ") || "None"}</TableCell>
                        <TableCell>{course.co_requisite.course_code.join(", ") || "None"}</TableCell>
                        <TableCell>{course.course_type}</TableCell>
                        <TableCell>{course.term.join(", ")}</TableCell>
                        <TableCell>
                            <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                                <Dropdown>
                                    <DropdownButton plain aria-label="More options">
                                        <EllipsisHorizontalIcon />
                                    </DropdownButton>
                                    <DropdownMenu anchor="bottom end">
                                        <DropdownItem href={`/csula-courses/edit/${course._id}`}>Edit</DropdownItem>
                                        <DropdownItem onClick={() => openDeleteDialog(course._id)}>Delete</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>

        <Dialog open={isOpen} onClose={setIsOpen}>
            <DialogTitle>Remove Course</DialogTitle>
            <DialogDescription>
                Are you sure you want to remove this course? This action cannot be undone.
            </DialogDescription>
            <DialogActions>
                <Button plain onClick={() => setIsOpen(false)}>
                    Cancel
                </Button>
                <Button onClick={() => {
                    if (selectedCourseId) {
                        onDelete(selectedCourseId);
                        setIsOpen(false);
                    }
                }}>
                    Remove
                </Button>
            </DialogActions>
        </Dialog>
        </>
    );
}

export default function Page() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string | "">("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);

    const fetchCourses = () => {
        fetch(apiUrl)
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to fetch courses.");
            }
            return res.json();
        })
        .then((data: Course[]) => {
            setCourses(data);
            setFilteredCourses(data);
             // Extract unique department names while keeping their IDs
            const departmentMap = new Map();
            data.forEach(course => {
                course.department.forEach(dep => {
                    if (!departmentMap.has(dep.name)) {
                        departmentMap.set(dep.name, dep);
                    }
                });
            });

            setDepartments(Array.from(departmentMap.values())); // Convert map back to array
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching courses:", err);
            setError("Error fetching courses.");
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        let filtered = courses.filter(course => {
            const searchLower = searchQuery.toLowerCase();
            return (
                course.course_name.toLowerCase().includes(searchLower) ||
                course.course_code.some(code => code.toLowerCase().includes(searchLower)) ||
                course.credits.toString().includes(searchLower) ||
                course.course_type.toLowerCase().includes(searchLower) ||
                course.term.some(term => term.toLowerCase().includes(searchLower)) ||
                course.department.some(dep => dep.name.toLowerCase().includes(searchLower))
            );
        });

        if (selectedDepartment) {
            filtered = filtered.filter(course => course.department.some(dep => dep.id === selectedDepartment));
        }

        setFilteredCourses(filtered);
    }, [searchQuery, selectedDepartment, courses]);

    // Handle delete action
    const handleDelete = (id: string) => {
        fetch(`${apiUrl}/${id}`, {
        method: "DELETE",
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Failed to delete course.");
            }
            setCourses((prev) => prev.filter((course) => course._id !== id));
        })
        .catch((err) => {
            console.error("Error deleting course:", err);
            setDeleteError("Failed to delete course.");
            setShowDeleteErrorDialog(true);
        });
    };

    if (loading) {
        return <div>Loading courses...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <Input 
                    type="text" 
                    placeholder="Search courses..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    className="w-full"
                />
            </div>
            <div className="mb-4">
                <Select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full"
                >
                    <option value="">All Departments</option>
                    {departments.map(dep => (
                        <option key={dep.id} value={dep.id}>{dep.name}</option>
                    ))}
                </Select>
            </div>
            <TableComponent courses={filteredCourses} onDelete={handleDelete} />

            {/* Error Dialog for delete failure */}
            <Dialog open={showDeleteErrorDialog} onClose={setShowDeleteErrorDialog}>
                <DialogTitle>Error</DialogTitle>
                <DialogDescription>{deleteError}</DialogDescription>
                <DialogActions>
                    <Button onClick={() => { setShowDeleteErrorDialog(false); setDeleteError(null); }}>
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
