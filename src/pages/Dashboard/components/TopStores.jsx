import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  Rating,
  Divider,
} from '@mui/material';
import { Storefront } from '@mui/icons-material';

export default function TopStores({ data = [] }) {
  return (
    <List>
      {data.map((store, index) => (
        <Box key={store.id}>
          <ListItem>
            <ListItemAvatar>
              <Avatar src={store.logo}>
                <Storefront />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">
                    {index + 1}. {store.name}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {store.ordersCount} طلب
                  </Typography>
                </Box>
              }
              secondary={
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Rating value={store.rating} readOnly size="small" precision={0.5} />
                  <Typography variant="caption" color="textSecondary">
                    ({store.rating})
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    •
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {store.category}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          {index < data.length - 1 && <Divider />}
        </Box>
      ))}
    </List>
  );
}