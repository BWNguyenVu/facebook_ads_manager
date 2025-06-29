'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CampaignData } from '@/types/facebook';
import { Eye, Calendar, DollarSign, Users } from 'lucide-react';

interface DataTableProps {
  data: CampaignData[];
  title?: string;
  description?: string;
}

export function DataTable({ data, title = "Campaign Data", description }: DataTableProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No campaign data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        <div className="text-sm text-gray-600">
          Total campaigns: {data.length}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Page ID</TableHead>
                <TableHead>Post ID</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <DollarSign className="h-4 w-4" />
                    <span>Budget</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Age Range</span>
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule</span>
                  </div>
                </TableHead>
                <TableHead>Account ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((campaign, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={campaign.name}>
                      {campaign.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {campaign.page_id}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {campaign.post_id}
                    </code>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      ${campaign.daily_budget}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {campaign.age_min} - {campaign.age_max}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(campaign.start_time).toLocaleDateString()}
                      </div>
                      {campaign.end_time && (
                        <div className="text-gray-500">
                          to {new Date(campaign.end_time).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.account_id ? (
                      <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                        {campaign.account_id}
                      </code>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
