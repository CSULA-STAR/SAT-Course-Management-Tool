"use client";

import { useState, useEffect } from "react";
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "@/components/dropdown";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { EllipsisHorizontalIcon } from "@heroicons/react/16/solid";
import { Dialog, DialogActions, DialogDescription, DialogTitle } from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Select } from "@/components/select";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/courses`;
const schoolsApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/schools`;

interface School {
    location: string;
    _id: string;
    name: string;
    id: string;
}

interface Course {
    _id: string;
    s_id: string;
    course_name: string;
    credits: number;
    equivalent_to: string[];
    category: string;
    department: string[];
    course_code: string[];
    school: School;
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
                    <TableHeader>Equivalent Course</TableHeader>
                    <TableHeader>Credits</TableHeader>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>School</TableHeader>
                    <TableHeader>Department</TableHeader>
                    <TableHeader></TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {courses.map((course) => (
                    <TableRow key={course._id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{course.course_name}</TableCell>
                        <TableCell>{course.course_code.join(", ")}</TableCell>
                        <TableCell>{course.equivalent_to.join(", ")}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>{course.school.name}</TableCell>
                        <TableCell>{course.department.join(", ")}</TableCell>
                        <TableCell>
                            <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                                <Dropdown>
                                    <DropdownButton plain aria-label="More options">
                                        <EllipsisHorizontalIcon />
                                    </DropdownButton>
                                    <DropdownMenu anchor="bottom end">
                                        <DropdownItem href={`/courses/edit/${course._id}`}>Edit</DropdownItem>
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
    const [schools, setSchools] = useState<School[]>([]);
    const [selectedSchool, setSelectedSchool] = useState<string | "">("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);

    const fetchSchools = () => {
        fetch(schoolsApiUrl)
        .then((res) => res.json())
        .then((data: School[]) => setSchools(data))
        .catch((err) => console.error("Error fetching schools:", err));
    }

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
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching courses:", err);
            setError("Error fetching courses.");
            setLoading(false);
        });
    }

    useEffect(() => {
        fetchSchools();
        fetchCourses();
    }, []);

    useEffect(() => {
        let filtered = courses.filter(course => {
            const searchLower = searchQuery.toLowerCase();
            return (
                course.course_name.toLowerCase().includes(searchLower) ||
                course.course_code.some(code => code.toLowerCase().includes(searchLower)) ||
                course.equivalent_to.some(eq => eq.toLowerCase().includes(searchLower)) ||
                course.credits.toString().includes(searchLower) ||
                course.category.toLowerCase().includes(searchLower) ||
                course.school.name.toLowerCase().includes(searchLower) ||
                course.department.some(dep => dep.toLowerCase().includes(searchLower))
            );
        });


        if (selectedSchool) {
            filtered = filtered.filter(course => course.school.id === selectedSchool);
        }

        setFilteredCourses(filtered);
    }, [searchQuery, selectedSchool, courses]);

    // Handle delete action: send DELETE request and update the UI.
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
        return <div>Loading schools...</div>;
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
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full"
                >
                    <option value="">All Schools</option>
                    {schools.map(school => (
                        <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                </Select>
            </div>
            <TableComponent courses={filteredCourses} onDelete={handleDelete} />

            {/* Error Dialog for delete failure */}
            <Dialog open={showDeleteErrorDialog} onClose={setShowDeleteErrorDialog}>
                <DialogTitle>Error</DialogTitle>
                <DialogDescription>{deleteError}</DialogDescription>
                <DialogActions>
                <Button
                    onClick={() => {
                    setShowDeleteErrorDialog(false);
                    setDeleteError(null);
                    }}
                >
                    Confirm
                </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
