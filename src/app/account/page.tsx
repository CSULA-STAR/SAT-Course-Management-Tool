import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid'
import { Pagination, PaginationGap, PaginationList, PaginationNext, PaginationPage, PaginationPrevious } from '@/components/pagination'

const users: User[] = [
    { 
        name: 'Lindsay Walton', 
        title: 'Front-end Developer', 
        email: 'lindsay.walton@example.com', 
        role: 'Member' 
    },
    // More users...
];

// Define TypeScript interface for users
interface User {
    name: string;
    title: string;
    email: string;
    role: string;
}

function TableComponent({ users }: { users: User[] }) {
    return (
        <>
        <Table grid striped className="[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]">
            <TableHead>
                <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Title</TableHeader>
                    <TableHeader>Role</TableHeader>
                    <TableHeader>Email</TableHeader>
                    <TableHeader></TableHeader>
                </TableRow>
            </TableHead>
            <TableBody>
                {users.map((user) => (
                    <TableRow key={user.email}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.title}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <div className="-mx-3 -my-1.5 sm:-mx-2.5">
                                <Dropdown>
                                <DropdownButton plain aria-label="More options">
                                    <EllipsisHorizontalIcon />
                                </DropdownButton>
                                <DropdownMenu anchor="bottom end">
                                    <DropdownItem>Edit</DropdownItem>
                                    <DropdownItem>Delete</DropdownItem>
                                </DropdownMenu>
                                </Dropdown>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {/* <Pagination className="mt-6">
            <PaginationPrevious href="?page=2" />
            <PaginationList>
                <PaginationPage href="?page=1">1</PaginationPage>
                <PaginationPage href="?page=2">2</PaginationPage>
                <PaginationPage href="?page=3" current>
                3
                </PaginationPage>
                <PaginationPage href="?page=4">4</PaginationPage>
                <PaginationGap />
                <PaginationPage href="?page=65">65</PaginationPage>
                <PaginationPage href="?page=66">66</PaginationPage>
            </PaginationList>
            <PaginationNext href="?page=4" />
        </Pagination> */}
        </>
    );
}

export default function Page() {
    return (
        <div className="p-4">
            <TableComponent users={users} />
        </div>
    );
}
