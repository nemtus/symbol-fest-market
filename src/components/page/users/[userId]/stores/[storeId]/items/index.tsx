/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocument } from 'react-firebase-hooks/firestore';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { useState, useEffect } from 'react';
import db, { auth, collection, doc, httpsCallable, functions } from '../../../../../../../configs/firebase';
import LoadingOverlay from '../../../../../../ui/LoadingOverlay';
import ErrorDialog from '../../../../../../ui/ErrorDialog';

interface Column {
  id: 'itemId' | 'itemName' | 'itemPrice' | 'itemPriceUnit' | 'itemDescription' | 'itemImageFile' | 'itemStatus';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  {
    id: 'itemId',
    label: '商品ID',
  },
  {
    id: 'itemName',
    label: '商品名',
  },
  {
    id: 'itemPrice',
    label: '価格',
  },
  {
    id: 'itemPriceUnit',
    label: '単位',
  },
  {
    id: 'itemStatus',
    label: 'ステータス',
  },
  {
    id: 'itemDescription',
    label: '商品説明',
  },
];

interface VerifyKycRequest {
  userId: string;
  storeId: string;
}

interface VerifyKycResponse {
  emailVerified: boolean;
  userKycVerified: boolean;
  storeEmailVerified: boolean;
  storePhoneNumberVerified: boolean;
  storeAddressVerified: boolean;
  storeKycVerified: boolean;
}

const httpsOnCallVerifyKyc = httpsCallable<VerifyKycRequest, VerifyKycResponse>(functions, 'httpsOnCallVerifyKyc');

const Items = () => {
  const navigate = useNavigate();
  const { userId, storeId } = useParams();
  const [user, loading, error] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId ?? ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(
    doc(db, 'users', userId ?? '', 'stores', storeId ?? ''),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [itemCollectionData, itemCollectionDataLoading, itemCollectionDataError] = useCollectionData(
    collection(db, 'users', userId ?? '', 'stores', storeId ?? '', 'items'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [storeExists, setStoreExists] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(-1);
  const [kycStatus, setKycStatus] = useState<VerifyKycResponse>({
    emailVerified: false,
    userKycVerified: false,
    storeEmailVerified: false,
    storePhoneNumberVerified: false,
    storeAddressVerified: false,
    storeKycVerified: false,
  });
  const [kycStatusLoading, setKycStatusLoading] = useState(false);
  const [kycStatusError, setKycStatusError] = useState<Error | undefined>(undefined);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    if (loading || userDocLoading || storeDocLoading || itemCollectionDataLoading || kycStatusLoading) {
      return;
    }
    if (!(user && userId && userId === user.uid)) {
      navigate('/auth/sign-in/');
      return;
    }
    if (userId !== storeId) {
      navigate(`/users/${userId}`);
      return;
    }
    const isExists = !!userDoc?.exists() && !!storeDoc?.exists();
    setStoreExists(isExists);
    httpsOnCallVerifyKyc({ userId, storeId })
      .then((res) => {
        setKycStatus(res.data);
        if (!res.data.userKycVerified) {
          navigate(`users/${userId}/verify-user-email`);
        }
        if (!res.data.storeKycVerified) {
          navigate(`users/${userId}/stores/${storeId}`);
        }
      })
      .catch((err) => {
        setKycStatusError(err as Error);
      })
      .finally(() => {
        setKycStatusLoading(false);
      });
  }, [
    userId,
    storeId,
    user,
    loading,
    navigate,
    userDoc,
    storeDoc,
    setStoreExists,
    setKycStatusLoading,
    setKycStatus,
    setKycStatusError,
    itemCollectionDataLoading,
    kycStatusLoading,
    storeDocLoading,
    userDocLoading,
  ]);

  const handleStoreCreate = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    if (!storeId) {
      throw Error('Invalid storeId');
    }
    navigate(`/users/${userId}/stores/${storeId}/create`);
  };

  const handleItemCreate = () => {
    if (!userId) {
      throw Error('Invalid userId');
    }
    if (!storeId) {
      throw Error('Invalid storeId');
    }
    navigate(`/users/${userId}/stores/${storeId}/items/create`);
  };

  return (
    <>
      {storeExists ? (
        <Container>
          <h2>商品情報</h2>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.align} style={{ minWidth: column.minWidth }}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(rowsPerPage > 0
                    ? itemCollectionData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : itemCollectionData
                  )?.map((document) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={document.itemId}>
                      {columns.map((column) => {
                        const value = document[column.id];
                        if (column.id === 'itemId' && userId && storeId) {
                          return (
                            <TableCell key={column.id} align={column.align} sx={{ wordBreak: 'break-all' }}>
                              <Link to={`/users/${userId}/stores/${storeId}/items/${value as string}`}>{value}</Link>
                            </TableCell>
                          );
                        }
                        return (
                          <TableCell key={column.id} align={column.align} sx={{ wordBreak: 'break-all' }}>
                            {column.format && typeof value === 'number' ? column.format(value) : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[10, 25, 100, { label: 'All', value: -1 }]}
              component="div"
              count={itemCollectionData ? itemCollectionData.length : 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
          <Button
            color="primary"
            variant="contained"
            size="large"
            onClick={handleItemCreate}
            disabled={!(kycStatus.storeKycVerified && kycStatus.userKycVerified)}
          >
            + 商品追加
          </Button>
        </Container>
      ) : (
        <Container maxWidth="sm">
          <h2>商品情報</h2>
          <Stack spacing="3">
            <div>
              <h3>店舗情報無し</h3>
              <div>出店及び商品登録を希望する場合は、まずは以下から店舗情報をご登録ください</div>
            </div>
            <Button color="primary" variant="contained" size="large" onClick={handleStoreCreate}>
              店舗登録
            </Button>
          </Stack>
        </Container>
      )}
      <LoadingOverlay
        open={loading || userDocLoading || storeDocLoading || itemCollectionDataLoading || kycStatusLoading}
      />
      <ErrorDialog open={!!error} error={error} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!itemCollectionDataError} error={itemCollectionDataError} />
      <ErrorDialog open={!!kycStatusError} error={kycStatusError} />
    </>
  );
};

export default Items;
