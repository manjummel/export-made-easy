import React from 'react';
import { ShieldCheck, UploadCloud } from 'lucide-react';
import { Button, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import PageHeader from '../components/shared/PageHeader';

export default function Certifications() {

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Certificate Center"
        subtitle="Manage Certificate of Origin (Form AI), Phytosanitary, GSP, and mandatory export quality inspection certificates."
        icon={ShieldCheck}
        breadcrumb={['ExportEase', 'Certificate Center']}
        badge={<Badge variant="success" size="sm" dot>Form AI Active</Badge>}
      />

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Certificate Title</TableHead>
            <TableHead>Issuing Authority</TableHead>
            <TableHead>Target Corridor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {[
            { title: 'Certificate of Origin (Form AI)', auth: 'Chamber of Commerce / FIEO', corridor: 'UAE (CEPA 0% Duty)', status: 'Approved' },
            { title: 'Phytosanitary Inspection Cert', auth: 'Spices Board / Plant Quarantine', corridor: 'Germany (EU GSP)', status: 'Pending Review' },
            { title: 'Fumigation Certificate', auth: 'Approved Inspection Agency', corridor: 'USA Customs', status: 'Approved' },
            { title: 'Certificate of Free Sale', auth: 'DGFT Export Promotion Council', corridor: 'Singapore ASEAN', status: 'Approved' },
          ].map((c) => (
            <TableRow key={c.title}>
              <TableCell className="font-bold text-primary">{c.title}</TableCell>
              <TableCell className="text-muted">{c.auth}</TableCell>
              <TableCell className="font-semibold text-[#1746D2]">{c.corridor}</TableCell>
              <TableCell>
                <Badge variant={c.status === 'Approved' ? 'success' : 'warning'} size="xs" dot>
                  {c.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="relative inline-block">
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf" />
                  <Button variant="secondary" size="xs" icon={UploadCloud}>
                    Upload PDF
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
