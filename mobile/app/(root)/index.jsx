import { useUser } from "@clerk/clerk-expo";
import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useState, useMemo } from "react";
import { 
  Alert, 
  FlatList, 
  Image, 
  RefreshControl, 
  Text, 
  TextInput,
  TouchableOpacity, 
  View,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SignOutButton } from "@/components/SignOutButton";
import { useTransactions } from "../../hooks/useTransactions";
import PageLoader from "../../components/PageLoader";
import { styles } from "../../assets/styles/home.styles";
import { BalanceCard } from "../../components/BalanceCard";
import { TransactionItem } from "../../components/TransactionItem";
import NoTransactionsFound from "../../components/NoTransactionsFound";
import { CATEGORIES } from "../../constants/categories";
import { COLORS } from "../../constants/colors";


export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { transactions, summary, isLoading, loadData, deleteTransaction, filterTransactions } = useTransactions(
    user.id
  );

  const filteredTransactions = useMemo(() => {
    return filterTransactions({
      searchQuery,
      type: typeFilter,
      category: categoryFilter,
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, filterTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(id) },
    ]);
  };

  if (isLoading && !refreshing) return <PageLoader />;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          {/* LEFT SECTION */}
          <View style={styles.headerLeft}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.welcomeContainer}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.usernameText}>
                {user?.emailAddresses[0]?.emailAddress.split("@")[0]}
              </Text>
            </View>
          </View>
          {/* RIGHT SECTON */}
          <View style={styles.headerRight}>
            <SignOutButton />
          </View>
        </View>
        {/* BALANCE SECTION */}
        <BalanceCard summary={summary} />
        
        {/* ACTION BUTTON */}
        <TouchableOpacity 
          style={styles.addTransactionButton} 
          onPress={() => router.push("/create")}
        >
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={styles.addTransactionButtonText}>Add Transaction</Text>
        </TouchableOpacity>

        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textLight} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* TYPE FILTER */}
        <View style={styles.typeFilterContainer}>
          <TouchableOpacity
            style={[styles.typeFilterPill, typeFilter === "all" && styles.typeFilterPillActive]}
            onPress={() => setTypeFilter("all")}
          >
            <Text style={[styles.typeFilterText, typeFilter === "all" && styles.typeFilterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeFilterPill, typeFilter === "income" && styles.typeFilterPillActive]}
            onPress={() => setTypeFilter("income")}
          >
            <Ionicons 
              name="arrow-up-circle" 
              size={16} 
              color={typeFilter === "income" ? COLORS.white : COLORS.income} 
            />
            <Text style={[styles.typeFilterText, typeFilter === "income" && styles.typeFilterTextActive]}>
              Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeFilterPill, typeFilter === "expense" && styles.typeFilterPillActive]}
            onPress={() => setTypeFilter("expense")}
          >
            <Ionicons 
              name="arrow-down-circle" 
              size={16} 
              color={typeFilter === "expense" ? COLORS.white : COLORS.expense} 
            />
            <Text style={[styles.typeFilterText, typeFilter === "expense" && styles.typeFilterTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* CATEGORY FILTER */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilterContainer}
          contentContainerStyle={styles.categoryFilterContent}
        >
          <TouchableOpacity
            style={[styles.categoryFilterPill, categoryFilter === "all" && styles.categoryFilterPillActive]}
            onPress={() => setCategoryFilter("all")}
          >
            <Text style={[styles.categoryFilterText, categoryFilter === "all" && styles.categoryFilterTextActive]}>
              All Categories
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryFilterPill, categoryFilter === category.name && styles.categoryFilterPillActive]}
              onPress={() => setCategoryFilter(category.name)}
            >
              <Ionicons 
                name={category.icon} 
                size={16} 
                color={categoryFilter === category.name ? COLORS.white : COLORS.text} 
              />
              <Text style={[styles.categoryFilterText, categoryFilter === category.name && styles.categoryFilterTextActive]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.transactionsHeaderContainer}>
          <Text style={styles.sectionTitle}>
            {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
      {/* ITEMS LIST */}
      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={filteredTransactions}
        renderItem={({ item }) => <TransactionItem item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<NoTransactionsFound />}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}
