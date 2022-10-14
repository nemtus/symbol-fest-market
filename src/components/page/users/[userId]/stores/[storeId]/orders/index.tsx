/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData, useDocument } from 'react-firebase-hooks/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import {
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
  id: // | 'userId'
  | 'email'
    | 'name'
    | 'phoneNumber'
    | 'zipCode'
    | 'address1'
    | 'address2'
    // | 'symbolAddress'
    | 'orderId'
    // | 'orderAmount'
    | 'orderTotalPrice'
    | 'orderTotalPriceUnit'
    | 'orderTotalPriceCC'
    | 'orderTotalPriceCCUnit'
    | 'orderTxHash'
    | 'orderStatus'
    // | 'itemId'
    | 'itemName';
  // | 'itemPrice'
  // | 'itemPriceUnit'
  // | 'itemDescription'
  // | 'itemImageFile'
  // | 'itemStatus';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  // {
  //   id: 'userId',
  //   label: 'お客様ID',
  // },
  {
    id: 'email',
    label: 'お客様メールアドレス',
  },
  {
    id: 'name',
    label: 'お客様名',
  },
  {
    id: 'phoneNumber',
    label: 'お客様電話番号',
  },
  {
    id: 'zipCode',
    label: 'お客様郵便番号',
  },
  {
    id: 'address1',
    label: 'お客様住所1',
  },
  {
    id: 'address2',
    label: 'お客様住所2',
  },
  // {
  //   id: 'symbolAddress',
  //   label: 'お客様Symbolアドレス',
  // },
  {
    id: 'orderId',
    label: '注文ID',
  },
  // {
  //   id: 'orderAmount',
  //   label: '注文数量',
  // },
  {
    id: 'orderTotalPrice',
    label: '注文金額',
  },
  {
    id: 'orderTotalPriceUnit',
    label: '注文通貨',
  },
  {
    id: 'orderTotalPriceCC',
    label: '注文金額',
  },
  {
    id: 'orderTotalPriceCCUnit',
    label: '注文通貨',
  },
  {
    id: 'orderTxHash',
    label: '注文 Tx Hash',
  },
  {
    id: 'orderStatus',
    label: '注文状態',
  },
  // {
  //   id: 'itemId',
  //   label: '商品ID',
  // },
  {
    id: 'itemName',
    label: '商品名',
  },
  // {
  //   id: 'itemPrice',
  //   label: '価格',
  // },
  // {
  //   id: 'itemPriceUnit',
  //   label: '単位',
  // },
  // {
  //   id: 'itemStatus',
  //   label: 'ステータス',
  // },
  // {
  //   id: 'itemDescription',
  //   label: '商品説明',
  // },
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

const OrdersForStore = () => {
  const navigate = useNavigate();
  const { userId, storeId } = useParams();
  const [authUser, authUserLoading, authUserError] = useAuthState(auth);
  const [userDoc, userDocLoading, userDocError] = useDocument(doc(db, 'users', userId ?? ''), {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
  const [storeDoc, storeDocLoading, storeDocError] = useDocument(
    doc(db, 'users', userId ?? '', 'stores', storeId ?? ''),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    },
  );
  const [orderCollectionData, orderCollectionDataLoading, orderCollectionDataError] = useCollectionData(
    collection(db, 'users', userId ?? '', 'stores', storeId ?? '', 'orders'),
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
    if (authUserLoading || userDocLoading || storeDocLoading || orderCollectionDataLoading || kycStatusLoading) {
      return;
    }
    if (!(authUser && userId && userId === authUser.uid)) {
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
    authUser,
    authUserLoading,
    navigate,
    userDoc,
    storeDoc,
    setStoreExists,
    setKycStatusLoading,
    setKycStatus,
    setKycStatusError,
    orderCollectionDataLoading,
    kycStatusLoading,
    storeDocLoading,
    userDocLoading,
  ]);

  return (
    <>
      {storeExists && kycStatus ? (
        <Container>
          <h2>注文情報</h2>
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
                    ? orderCollectionData?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    : orderCollectionData
                  )?.map((document) => (
                    <TableRow hover role="checkbox" tabIndex={-1} key={document.itemId}>
                      {columns.map((column) => {
                        const value = document[column.id];
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
              count={orderCollectionData ? orderCollectionData.length : 0}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Container>
      ) : (
        <Container maxWidth="sm">
          <h2>注文情報</h2>
          <Stack spacing="3">
            <div>
              <h3>注文情報無し</h3>
              <div>お客様からの注文はまだ無いようです。</div>
            </div>
          </Stack>
        </Container>
      )}
      <LoadingOverlay
        open={authUserLoading || userDocLoading || storeDocLoading || orderCollectionDataLoading || kycStatusLoading}
      />
      <ErrorDialog open={!!authUserError} error={authUserError} />
      <ErrorDialog open={!!userDocError} error={userDocError} />
      <ErrorDialog open={!!storeDocError} error={storeDocError} />
      <ErrorDialog open={!!orderCollectionDataError} error={orderCollectionDataError} />
      <ErrorDialog open={!!kycStatusError} error={kycStatusError} />
    </>
  );
};

export default OrdersForStore;
